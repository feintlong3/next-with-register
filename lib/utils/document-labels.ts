/**
 * 書類タイプに対応する日本語ラベルを取得
 */
export function getDocumentLabel(type: string | undefined): string {
  switch (type) {
    case 'drivers_license':
      return '運転免許証'
    case 'my_number':
      return 'マイナンバーカード'
    case 'passport':
      return 'パスポート'
    default:
      return '未選択'
  }
}
