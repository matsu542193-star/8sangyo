const MODEL = 'claude-sonnet-4-6';

const PROMPT = `あなたは請求書・見積書の読み取りAIです。
添付された画像から情報を読み取り、次のJSON形式のみを出力してください。説明文やコードブロックの記号(\`\`\`)は一切付けないでください。

{"customer":"","honorific":"様","site":"","billingAddress":"","issueDate":"YYYY-MM-DD","dueDate":"YYYY-MM-DD","items":[{"name":"","qty":1,"price":0}],"note":"","totalOnDoc":0}

- 日付が和暦の場合は西暦(YYYY-MM-DD)に変換してください
- 読み取れない項目は空文字または0にしてください
- totalOnDoc には書面に記載されている合計金額(数値)を入れてください
- items の price は1件あたりの単価(数値)にしてください`;

export async function ocrInvoiceImage(dataUrl) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('VITE_ANTHROPIC_API_KEY が設定されていません(.env.local を確認してください)');
  }

  const match = /^data:(image\/[a-zA-Z]+);base64,(.+)$/.exec(dataUrl);
  if (!match) throw new Error('画像データの形式が不正です');
  const [, mediaType, base64Data] = match;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64Data } },
            { type: 'text', text: PROMPT },
          ],
        },
      ],
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`AI読み取りに失敗しました(${res.status})。もう一度撮影してお試しください。 ${text}`);
  }

  const data = await res.json();
  const text = data?.content?.find((c) => c.type === 'text')?.text || '';
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('読み取り結果を解析できませんでした。もう一度撮影してお試しください。');
  }

  try {
    return JSON.parse(jsonMatch[0]);
  } catch {
    throw new Error('読み取り結果を解析できませんでした。もう一度撮影してお試しください。');
  }
}
