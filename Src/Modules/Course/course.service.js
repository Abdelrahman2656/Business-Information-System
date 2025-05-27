import { Course, Student } from "../../../Database/index.js";
import { AppError } from "../../Utils/AppError.js";
import { messages } from "../../Utils/constant/messages.js";

//-------------------------------------------------toggle Registration-----------------------------------------------------------

export const toggleRegistration = async (req, res, next) => {
  try {
    const { courseId, confirm } = req.body;
    const studentId = req.authUser._id;
    const studentExist = await Student.findById(studentId);
    if (!studentExist) {
      return next(new AppError(messages.user.notFound, 404));
    }

    // تحديد الترم والسنة الدراسية تلقائيًا من بيانات الطالب
    const semester = studentExist.getCurrentSemester();
    const yearLevel = studentExist.getYearLevel();

    // التحقق من وجود الدورات
    const coursesExist = await Course.find({ '_id': { $in: courseId } });
    if (!coursesExist || coursesExist.length !== courseId.length) {
      return next(new AppError(messages.course.notFound, 404));
    }

    let updatedCourses = [];

    // لكل مادة
    for (const id of courseId) {
      const courseExist = await Course.findById(id);
      if (!courseExist) {
        return next(new AppError(messages.course.notFound, 404));
      }

      const isRegistered = studentExist.registerCourses.some(
        registeredCourse => registeredCourse.course.toString() === id
      );

      // إضافة المادة إذا لم تكن مسجلة
      if (!isRegistered) {
        const registeredInCurrentSemester = studentExist.registerCourses.filter(
          (course) => course.semester === semester && course.yearLevel === yearLevel
        );

        if (registeredInCurrentSemester.length < 5) {
          if (courseExist.capacity.current < courseExist.capacity.max) {
            studentExist.registerCourses.push({
              course: id,
              semester,
              yearLevel,
            });
            courseExist.capacity.current += 1; // زيادة السعة الحالية للمادة
            updatedCourses.push({ course: courseExist.name, action: 'added' });
          } else {
            return res
              .status(400)
              .json({ message: `المادة ${courseExist.name} ممتلئة` });
          }
        } else {
          return res
            .status(400)
            .json({ message: "يمكنك تسجيل 5 مواد فقط في هذا الترم." });
        }
      } else {
        // إزالة المادة إذا كانت مسجلة بالفعل
        studentExist.registerCourses = studentExist.registerCourses.filter(
          (course) => course.course.toString() !== id
        );
        courseExist.capacity.current -= 1; // تقليل السعة الحالية للمادة
        updatedCourses.push({ course: courseExist.name, action: 'removed' });
      }

      // حفظ التغييرات في المادة
      await courseExist.save();
    }

    // حفظ التحديثات في سجل الطالب
    await studentExist.save();

    // إذا تم طلب تأكيد التسجيل
    if (confirm) {
      const registeredInCurrentSemester = studentExist.registerCourses.filter(
        (course) => course.semester === semester && course.yearLevel === yearLevel
      );

      if (registeredInCurrentSemester.length < 5) {
        return res.status(400).json({
          success: false,
          message: "لا يمكن تأكيد التسجيل. يجب تسجيل 5 مواد على الأقل للانتقال إلى الترم التالي.",
        });
      }

      // الرد فورًا مع تأكيد الاستلام
      res.status(200).json({
        success: true,
        message: "تم تأكيد التسجيل، سيتم الانتقال للترم/السنة التالية خلال 30 ثانية.",
      });

      // ⏳ تأخير 30 ثانية ثم التحديث
      setTimeout(async () => {
        try {
          // 1. تعديل السعة لكل كورس مسجل حاليًا
          for (const reg of registeredInCurrentSemester) {
            const course = await Course.findById(reg.course);
            if (course && course.capacity.current > 0) {
              course.capacity.current -= 1;
              await course.save();
            }
          }

          // 2. حذف الكورسات القديمة من سجل الطالب
          studentExist.registerCourses = studentExist.registerCourses.filter(
            (course) => !(course.semester === semester && course.yearLevel === yearLevel)
          );

          // 3. ترقية الترم والسنة
          await studentExist.advanceSemester();

          // 4. حفظ الطالب بعد التعديلات
          await studentExist.save();

          console.log(`✅ الطالب ${studentExist._id} تم نقله إلى: ${studentExist.getYearLevel()} - ${studentExist.getCurrentSemester()}`);
        } catch (err) {
          console.error("❌ خطأ أثناء تحديث بيانات الطالب بعد تأكيد التسجيل:", err);
        }
      }, 30 * 1000);
    } else {
      return res.status(200).json({
        success: true,
        updatedCourses: studentExist.registerCourses,
        message: 'تم التحديث بنجاح.',
      });
    }

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "خطأ في السيرفر" });
  }
};


//-------------------------------------------------get register course-----------------------------------------------------------
export const registerCourse = async (req, res, next) => {
  //get data from params
  const studentId  = req.authUser._id;
  const student = await Student.findById(studentId);
  const TotalStudent = await Student.countDocuments()
  if (!student) {
    return next(new AppError(messages.user.notFound, 404));
  }
  const registeredCourses = student.registerCourses;
  const courseCount = registeredCourses.length;
  //send response
  return res
    .status(200)
    .json({ success: true,courseCount ,courses: student.registerCourses });
};
//-------------------------------------------------get unRegister course-----------------------------------------------------------
export const unRegisterCourses = async (req, res, next) => {
  //get data from params
  const  studentId  = req.authUser._id;
  //find student exist
  const student = await Student.findById(studentId).populate("registerCourses")
  if (!student) {
    return next(new AppError(messages.user.notFound, 404));
  }
  let currentSemester = student.getCurrentSemester()
  let yearLevel= student.getYearLevel()

  const allCourse = await Course.find({yearLevel, semester:currentSemester})
   // الفلترة: شيل المواد اللي الطالب مسجلها بالفعل
   const unregisteredCourses = allCourse.filter(course =>
    !student.registerCourses.some(registered =>
      registered.course._id.toString() === course._id.toString()
    )
  );
//send response
return res.status(200).json({success:true, courses:unregisteredCourses})
};
//-------------------------------------------------get capacity course-----------------------------------------------------------
export const getCoursesWithCapacity = async (req, res) => {
  try {
    const courses = await Course.find();
    const TotalCourse = await Course.countDocuments()
    const data = courses.map((course) => ({
      code: course.courseCode,
      name: course.name,
      capacity: `${course.capacity.current}/${course.capacity.max}`,
      percentage: `${Math.round(
        (course.capacity.current / course.capacity.max) * 100
      )}%`,
    }));

    res.status(200).json({ success: true,TotalCourse, courses: data });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "حدث خطأ أثناء تحميل معلومات السعة للكورسات" });
  }
};
//-------------------------------------------------get all course-----------------------------------------------------------------
export const allCourse = async (req, res, next) => {
  //get data from params
  
  const course = await Course.find();
  
  //count course
  const TotalCourse = await Course.countDocuments()
  //send response
  return res.status(200)
    .json({ success: true, courseData: course , TotalCourse });
};
//-------------------------------------------------get Avalilable course-----------------------------------------------------------
export const availableCourse = async(req,res,next)=>{
//ger userID
const StudentId= req.authUser._id
//get student
let student = await  Student.findById(StudentId) 
if (!student) {
  return next(new AppError(messages.user.notFound, 404));
}
const currentSemester = student.getCurrentSemester()
const yearLevel = student.getYearLevel()

//Avaliable
const availableCourse = await Course.find({yearLevel , semester:currentSemester})
const TotalCourseAvailable= availableCourse.length
//send response
return res.status(200).json({
  success: true,
  TotalCourseAvailable,
  courses: availableCourse,
  message: "المواد المتاحة حسب سنتك الدراسية والترم الحالي",
});
}