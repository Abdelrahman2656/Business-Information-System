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

    const semester = studentExist.getCurrentSemester();
    const yearLevel = studentExist.getYearLevel();

    const coursesExist = await Course.find({ '_id': { $in: courseId } });
    if (!coursesExist || coursesExist.length !== courseId.length) {
      return next(new AppError(messages.course.notFound, 404));
    }

    let updatedCourses = [];

    for (const id of courseId) {
      const courseExist = await Course.findById(id);
      if (!courseExist) {
        return next(new AppError(messages.course.notFound, 404));
      }

      if (courseExist.yearLevel !== yearLevel) {
        return res.status(400).json({
          success: false,
          message: `لا يمكنك التسجيل في المادة ${courseExist.name} لأنها من السنة ${courseExist.yearLevel} وأنت في السنة ${yearLevel}`
        });
      }

      if (courseExist.semester !== semester) {
        return res.status(400).json({
          success: false,
          message: `لا يمكنك التسجيل في المادة ${courseExist.name} لأنها من الترم ${courseExist.semester} وأنت في الترم ${semester}`
        });
      }

      const isRegistered = studentExist.registerCourses.some(
        registeredCourse => registeredCourse.course.toString() === id
      );

      if (!isRegistered) {
        const registeredInCurrentSemester = studentExist.registerCourses.filter(
          (course) => course.semester === semester && course.yearLevel === yearLevel
        );

        if (registeredInCurrentSemester.length >= 5) {
          return res.status(400).json({ 
            success: false,
            message: "يمكنك تسجيل 5 مواد فقط في هذا الترم." 
          });
        }

        if (courseExist.capacity.current >= courseExist.capacity.max) {
          return res.status(400).json({ 
            success: false,
            message: `المادة ${courseExist.name} ممتلئة` 
          });
        }

        studentExist.registerCourses.push({
          course: id,
          semester,
          yearLevel,
        });
        courseExist.capacity.current += 1;
        updatedCourses.push({ course: courseExist.name, action: 'added' });
      } else {
        studentExist.registerCourses = studentExist.registerCourses.filter(
          (course) => course.course.toString() !== id
        );
        courseExist.capacity.current -= 1;
        updatedCourses.push({ course: courseExist.name, action: 'removed' });
      }

      await courseExist.save();
    }

    await studentExist.save();

    if (confirm) {
      const registeredInCurrentSemester = studentExist.registerCourses.filter(
        (course) => course.semester === semester && course.yearLevel === yearLevel
      );

      let minRequiredCourses;
      let errorMessage;
      
      if (semester === 3) {
        minRequiredCourses = 1;
        errorMessage = "لا يمكن تأكيد التسجيل. يجب تسجيل مادة واحدة على الأقل في الترم الثالث للانتقال إلى الترم التالي.";
      } else {
        minRequiredCourses = 4;
        errorMessage = "لا يمكن تأكيد التسجيل. يجب تسجيل 4 مواد على الأقل في الترم الأول والثاني للانتقال إلى الترم التالي.";
      }

      if (registeredInCurrentSemester.length < minRequiredCourses) {
        return res.status(400).json({
          success: false,
          message: errorMessage
        });
      }

      res.status(200).json({
        success: true,
        message: "تم تأكيد التسجيل، سيتم الانتقال للترم/السنة التالية خلال 30 ثانية.",
      });

      setTimeout(async () => {
        try {
          for (const reg of registeredInCurrentSemester) {
            const course = await Course.findById(reg.course);
            if (course && course.capacity.current > 0) {
              course.capacity.current -= 1;
              await course.save();
            }
          }

          studentExist.registerCourses = studentExist.registerCourses.filter(
            (course) => !(course.semester === semester && course.yearLevel === yearLevel)
          );

          await studentExist.advanceSemester();
          await studentExist.save();

          console.log(`✅ الطالب ${studentExist._id} تم نقله إلى: ${studentExist.getYearLevel()} - ${studentExist.getCurrentSemester()}`);
        } catch (err) {
          console.error("❌ خطأ أثناء تحديث بيانات الطالب بعد تأكيد التسجيل:", err);
        }
      }, 30 * 1000);
    } else {
      return res.status(200).json({
        success: true,
        updatedCourses,
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

//-------------------------------------------------Add Course Registration-----------------------------------------------------------
export const addCourseRegistration = async (req, res, next) => {
  try {
    const { courseId } = req.body;
    const studentId = req.authUser._id;
    const studentExist = await Student.findById(studentId);
    if (!studentExist) {
      return next(new AppError(messages.user.notFound, 404));
    }

    const semester = studentExist.getCurrentSemester();
    const yearLevel = studentExist.getYearLevel();

    const coursesExist = await Course.find({ '_id': { $in: courseId } });
    if (!coursesExist || coursesExist.length !== courseId.length) {
      return next(new AppError(messages.course.notFound, 404));
    }

    let updatedCourses = [];

    for (const id of courseId) {
      const courseExist = await Course.findById(id);
      if (!courseExist) {
        return next(new AppError(messages.course.notFound, 404));
      }

      if (courseExist.yearLevel !== yearLevel) {
        return res.status(400).json({
          success: false,
          message: `لا يمكنك التسجيل في المادة ${courseExist.name} لأنها من السنة ${courseExist.yearLevel} وأنت في السنة ${yearLevel}`
        });
      }

      if (courseExist.semester !== semester) {
        return res.status(400).json({
          success: false,
          message: `لا يمكنك التسجيل في المادة ${courseExist.name} لأنها من الترم ${courseExist.semester} وأنت في الترم ${semester}`
        });
      }

      const isRegistered = studentExist.registerCourses.some(
        registeredCourse => registeredCourse.course.toString() === id
      );

      if (isRegistered) {
        return res.status(400).json({
          success: false,
          message: `أنت مسجل بالفعل في المادة ${courseExist.name}`
        });
      }

      const registeredInCurrentSemester = studentExist.registerCourses.filter(
        (course) => course.semester === semester && course.yearLevel === yearLevel
      );

      if (registeredInCurrentSemester.length >= 5) {
        return res.status(400).json({ 
          success: false,
          message: "يمكنك تسجيل 5 مواد فقط في هذا الترم." 
        });
      }

      if (courseExist.capacity.current >= courseExist.capacity.max) {
        return res.status(400).json({ 
          success: false,
          message: `المادة ${courseExist.name} ممتلئة` 
        });
      }

      studentExist.registerCourses.push({
        course: id,
        semester,
        yearLevel,
      });
      courseExist.capacity.current += 1;
      updatedCourses.push({ course: courseExist.name, action: 'added' });
      await courseExist.save();
    }

    await studentExist.save();

    return res.status(200).json({
      success: true,
      updatedCourses,
      message: 'تم إضافة المواد بنجاح.',
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "خطأ في السيرفر" });
  }
};

//-------------------------------------------------Delete Course Registration-----------------------------------------------------------
export const deleteCourseRegistration = async (req, res, next) => {
  try {
    const { courseId } = req.body;
    const studentId = req.authUser._id;
    const studentExist = await Student.findById(studentId);
    if (!studentExist) {
      return next(new AppError(messages.user.notFound, 404));
    }

    const courseExist = await Course.findById(courseId);
    if (!courseExist) {
      return next(new AppError(messages.course.notFound, 404));
    }

    const isRegistered = studentExist.registerCourses.some(
      registeredCourse => registeredCourse.course.toString() === courseId
    );

    if (!isRegistered) {
      return res.status(400).json({
        success: false,
        message: `أنت غير مسجل في المادة ${courseExist.name}`
      });
    }

    studentExist.registerCourses = studentExist.registerCourses.filter(
      (course) => course.course.toString() !== courseId
    );
    courseExist.capacity.current -= 1;
    await courseExist.save();
    await studentExist.save();

    return res.status(200).json({
      success: true,
      message: `تم حذف المادة ${courseExist.name} بنجاح.`,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "خطأ في السيرفر" });
  }
};

//-------------------------------------------------Confirm Course Registration-----------------------------------------------------------
export const confirmCourseRegistration = async (req, res, next) => {
  try {
    const studentId = req.authUser._id;
    const studentExist = await Student.findById(studentId);
    if (!studentExist) {
      return next(new AppError(messages.user.notFound, 404));
    }

    const semester = studentExist.getCurrentSemester();
    const yearLevel = studentExist.getYearLevel();

    const registeredInCurrentSemester = studentExist.registerCourses.filter(
      (course) => course.semester === semester && course.yearLevel === yearLevel
    );

    let minRequiredCourses;
    let errorMessage;
    
    if (semester === 3) {
      minRequiredCourses = 1;
      errorMessage = "لا يمكن تأكيد التسجيل. يجب تسجيل مادة واحدة على الأقل في الترم الثالث للانتقال إلى الترم التالي.";
    } else {
      minRequiredCourses = 4;
      errorMessage = "لا يمكن تأكيد التسجيل. يجب تسجيل 4 مواد على الأقل في الترم الأول والثاني للانتقال إلى الترم التالي.";
    }

    if (registeredInCurrentSemester.length < minRequiredCourses) {
      return res.status(400).json({
        success: false,
        message: errorMessage
      });
    }

    res.status(200).json({
      success: true,
      message: "تم تأكيد التسجيل، سيتم الانتقال للترم/السنة التالية خلال 30 ثانية.",
    });

    setTimeout(async () => {
      try {
        for (const reg of registeredInCurrentSemester) {
          const course = await Course.findById(reg.course);
          if (course && course.capacity.current > 0) {
            course.capacity.current -= 1;
            await course.save();
          }
        }

        studentExist.registerCourses = studentExist.registerCourses.filter(
          (course) => !(course.semester === semester && course.yearLevel === yearLevel)
        );

        await studentExist.advanceSemester();
        await studentExist.save();

        console.log(`✅ الطالب ${studentExist._id} تم نقله إلى: ${studentExist.getYearLevel()} - ${studentExist.getCurrentSemester()}`);
      } catch (err) {
        console.error("❌ خطأ أثناء تحديث بيانات الطالب بعد تأكيد التسجيل:", err);
      }
    }, 30 * 1000);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "خطأ في السيرفر" });
  }
};