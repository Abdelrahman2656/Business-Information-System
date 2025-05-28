const generateMessage = (entity) => ({
  alreadyExist: `${entity} موجود بالفعل`,
  notFound: `${entity} غير موجود`,
  failToCreate: `فشل في إنشاء ${entity}`,
  failToUpdate: `فشل في تحديث ${entity}`,
  failToDelete: `فشل في حذف ${entity}`,
  createdSuccessfully: `تم إنشاء ${entity} بنجاح`,
  updateSuccessfully: `تم تحديث ${entity} بنجاح`,
  deleteSuccessfully: `تم حذف ${entity} بنجاح`,
  notAllowed: `غير مصرح لك بالوصول إلى هذه الواجهة`,
  verifiedSuccessfully: `تم التحقق من ${entity} بنجاح`,
});

export const messages = {
  user: {
    ...generateMessage("المستخدم"),
    verified: "تم التحقق من المستخدم بنجاح",
    notAuthorized: "غير مصرح لك بالوصول إلى هذه الواجهة",
    invalidCredential: "هناك خطأ في كلمة المرور",
    changePassword: "تم تغيير كلمة المرور بنجاح",
    AlreadyHasOtp: "أنت بالفعل تمتلك OTP",
    checkEmail: "تحقق من بريدك الإلكتروني",
    invalidOTP: "OTP غير صالح",
    expireOTP: "OTP انتهت صلاحيته",
    login: "تهانينا، يرجى تسجيل الدخول",
    loginSuccessfully: "تم تسجيل دخول المستخدم بنجاح",
    Incorrect: "خطأ في البريد الإلكتروني أو كلمة المرور",
    AlreadyVerified: "أنت بالفعل تم التحقق منك",
   customIdRequired: "برجاء استخدام الرقم التعريفي الذي تم إرساله إلى بريدك الإلكتروني"

  },
  course:{
    ...generateMessage("الماده"),
    addCourseSuccessfully:`تم اضافه الماده بنجاح`
  }
};
