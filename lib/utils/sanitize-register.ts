import { type RegisterSchema } from '@/lib/schema/register-schema'

/**
 * マージされたデータから、現在の documentType に不要なフィールドを除去する関数
 * as any を使わず、必要なキーだけを明示的にピックアップ（Allow List方式）します。
 */
export const sanitizeRegisterData = (
  dirtyData: Partial<RegisterSchema>
): Partial<RegisterSchema> => {
  // 1. 全タイプ共通のフィールドを抽出
  const common = {
    // Step 1 Basic
    fullName: dirtyData.fullName,
    email: dirtyData.email,
    phoneNumber: dirtyData.phoneNumber,
    address: dirtyData.address,

    // Step 2 Common
    documentType: dirtyData.documentType,
    frontImage: dirtyData.frontImage,
  }

  // 2. documentType に応じて必要なフィールドだけを結合して返す
  // これにより、関係ないフィールド（ゴミ）は物理的に新しいオブジェクトに含まれなくなります
  switch (dirtyData.documentType) {
    case 'drivers_license':
      return {
        ...common,
        documentType: 'drivers_license', // 型推論のために明示
        licenseNumber: dirtyData.licenseNumber,
        backImage: dirtyData.backImage, // 免許証は裏面あり
      }

    case 'passport':
      return {
        ...common,
        documentType: 'passport',
        passportNumber: dirtyData.passportNumber,
        // パスポートは裏面(backImage)を含めない -> ゴミがあっても消える
      }

    case 'my_number':
      return {
        ...common,
        documentType: 'my_number',
        myNumber: dirtyData.myNumber,
        expirationDate: dirtyData.expirationDate,
        backImage: dirtyData.backImage,
      }

    default:
      // documentTypeが決まっていない場合は共通部分だけ返す
      return common
  }
}
