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
//-------------------------------------------------get Delayed Courses-----------------------------------------------------------
export const getDelayedCourses = async (req, res, next) => {
  try {
    const StudentId = req.authUser._id;
    const student = await Student.findById(StudentId);
    if (!student) {
      return next(new AppError(messages.user.notFound, 404));
    }

    const currentSemester = student.getCurrentSemester();
    const yearLevel = student.getYearLevel();

    // Get all courses from previous semesters
    const previousCourses = await Course.find({
      $or: [
        { yearLevel: { $lt: yearLevel } },
        { yearLevel, semester: { $lt: currentSemester } }
      ]
    });

    // Get student's registered courses
    const registeredCourses = student.registerCourses;

    // Find courses that student hasn't registered for
    const delayedCourses = previousCourses.filter(course =>
      !registeredCourses.some(registered =>
        registered.course.toString() === course._id.toString()
      )
    );

    // Group delayed courses by semester and year
    const groupedDelayedCourses = delayedCourses.reduce((acc, course) => {
      const key = `${course.yearLevel}-${course.semester}`;
      if (!acc[key]) {
        acc[key] = {
          yearLevel: course.yearLevel,
          semester: course.semester,
          courses: []
        };
      }
      acc[key].courses.push(course);
      return acc;
    }, {});

    // Convert to array and sort by year and semester
    const sortedDelayedCourses = Object.values(groupedDelayedCourses).sort((a, b) => {
      if (a.yearLevel !== b.yearLevel) {
        return a.yearLevel - b.yearLevel;
      }
      return a.semester - b.semester;
    });

    return res.status(200).json({
      success: true,
      delayedCourses: sortedDelayedCourses,
      message: "المواد المتأخرة من الترمات السابقة"
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "خطأ في السيرفر" });
  }
};

//-------------------------------------------------get Available course-----------------------------------------------------------
export const availableCourse = async(req, res, next) => {
  try {
    const StudentId = req.authUser._id;
    const student = await Student.findById(StudentId);
    if (!student) {
      return next(new AppError(messages.user.notFound, 404));
    }

    const currentSemester = student.getCurrentSemester();
    const yearLevel = student.getYearLevel();

    // Get current semester courses
    const currentSemesterCourses = await Course.find({
      yearLevel,
      semester: currentSemester
    });

    // Get student's registered courses for current semester
    const registeredCurrentSemester = student.registerCourses.filter(
      course => course.semester === currentSemester && course.yearLevel === yearLevel
    );

    // Get student's confirmed courses
    const confirmedCourses = student.confirmedCourses;

    // Filter out registered and confirmed courses from current semester
    const availableCurrentSemester = currentSemesterCourses.filter(course =>
      !registeredCurrentSemester.some(registered =>
        registered.course.toString() === course._id.toString()
      ) &&
      !confirmedCourses.some(confirmed =>
        confirmed.course.toString() === course._id.toString()
      )
    );

    // Get delayed courses from previous semesters
    const previousCourses = await Course.find({
      $or: [
        { yearLevel: { $lt: yearLevel } },
        { yearLevel, semester: { $lt: currentSemester } }
      ]
    });

    // Filter out all registered and confirmed courses
    const availablePreviousCourses = previousCourses.filter(course =>
      !student.registerCourses.some(registered =>
        registered.course.toString() === course._id.toString()
      ) &&
      !confirmedCourses.some(confirmed =>
        confirmed.course.toString() === course._id.toString()
      )
    );

    // Group previous courses by semester and year
    const groupedPreviousCourses = availablePreviousCourses.reduce((acc, course) => {
      const key = `${course.yearLevel}-${course.semester}`;
      if (!acc[key]) {
        acc[key] = {
          yearLevel: course.yearLevel,
          semester: course.semester,
          courses: []
        };
      }
      acc[key].courses.push(course);
      return acc;
    }, {});

    // Convert to array and sort
    const sortedPreviousCourses = Object.values(groupedPreviousCourses).sort((a, b) => {
      if (a.yearLevel !== b.yearLevel) {
        return a.yearLevel - b.yearLevel;
      }
      return a.semester - b.semester;
    });

    return res.status(200).json({
      success: true,
      currentSemester: {
        yearLevel,
        semester: currentSemester,
        courses: availableCurrentSemester
      },
      previousSemesters: sortedPreviousCourses,
      message: "المواد المتاحة في الترم الحالي والمواد المتأخرة من الترمات السابقة"
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "خطأ في السيرفر" });
  }
};

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
    let errors = [];

    for (const id of courseId) {
      const courseExist = await Course.findById(id);
      if (!courseExist) {
        return next(new AppError(messages.course.notFound, 404));
      }

      if (courseExist.yearLevel !== yearLevel) {
        errors.push(`لا يمكنك التسجيل في المادة ${courseExist.name} لأنها من السنة ${courseExist.yearLevel} وأنت في السنة ${yearLevel}`);
        continue;
      }

      if (courseExist.semester !== semester) {
        errors.push(`لا يمكنك التسجيل في المادة ${courseExist.name} لأنها من الترم ${courseExist.semester} وأنت في الترم ${semester}`);
        continue;
      }

      const isRegistered = studentExist.registerCourses.some(
        registeredCourse => registeredCourse.course.toString() === id
      );

      if (isRegistered) {
        errors.push(`أنت مسجل بالفعل في المادة ${courseExist.name}`);
        continue;
      }

      const registeredInCurrentSemester = studentExist.registerCourses.filter(
        (course) => course.semester === semester && course.yearLevel === yearLevel
      );

      if (registeredInCurrentSemester.length >= 5) {
        errors.push("يمكنك تسجيل 5 مواد فقط في هذا الترم.");
        break;
      }

      if (courseExist.capacity.current >= courseExist.capacity.max) {
        errors.push(`المادة ${courseExist.name} ممتلئة`);
        continue;
      }

      studentExist.registerCourses.push({
        course: id,
        semester,
        yearLevel,
      });
      courseExist.capacity.current += 1;
      updatedCourses.push({
        course: courseExist.name,
        action: 'added',
        courseDetails: {
          _id: courseExist._id,
          courseCode: courseExist.courseCode,
          name: courseExist.name,
          credits: courseExist.credits,
          instructor: courseExist.instructor,
          day: courseExist.day,
          yearLevel: courseExist.yearLevel,
          semester: courseExist.semester,
          capacity: courseExist.capacity
        }
      });
      await courseExist.save();
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        errors,
        updatedCourses
      });
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
      courseExist
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

    // Check if student is already in confirmation period
    if (studentExist.confirmationStartTime) {
      const timeElapsed = Date.now() - studentExist.confirmationStartTime;
      if (timeElapsed > 60000) { // 1 minute in milliseconds
        // If more than 1 minute has passed, proceed with semester advancement
        await advanceStudentSemester(studentExist);
        return res.status(200).json({
          success: true,
          message: "تم الانتقال للترم/السنة التالية بنجاح.",
        });
      }
      return res.status(200).json({
        success: true,
        message: `يمكنك تعديل المواد خلال ${Math.ceil((60000 - timeElapsed) / 1000)} ثانية قبل الانتقال للترم التالي.`,
        timeRemaining: Math.ceil((60000 - timeElapsed) / 1000)
      });
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

    // Set confirmation start time
    studentExist.confirmationStartTime = Date.now();
    await studentExist.save();

    res.status(200).json({
      success: true,
      message: "تم تأكيد التسجيل، يمكنك تعديل المواد خلال دقيقة واحدة قبل الانتقال للترم التالي.",
      timeRemaining: 60
    });

    // Schedule semester advancement after 1 minute
    setTimeout(async () => {
      try {
        await advanceStudentSemester(studentExist);
      } catch (err) {
        console.error("❌ خطأ أثناء تحديث بيانات الطالب بعد تأكيد التسجيل:", err);
      }
    }, 60000);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "خطأ في السيرفر" });
  }
};

// Helper function to advance student semester
const advanceStudentSemester = async (student) => {
  const semester = student.getCurrentSemester();
  const yearLevel = student.getYearLevel();
  
  const registeredInCurrentSemester = student.registerCourses.filter(
    (course) => course.semester === semester && course.yearLevel === yearLevel
  );

  // Save confirmed courses before clearing
  for (const reg of registeredInCurrentSemester) {
    const course = await Course.findById(reg.course);
    if (course) {
      student.confirmedCourses.push({
        course: reg.course,
        courseId: course.courseCode,
        semester: reg.semester,
        yearLevel: reg.yearLevel,
        confirmedAt: new Date()
      });
    }
  }

  // Update course capacities
  for (const reg of registeredInCurrentSemester) {
    const course = await Course.findById(reg.course);
    if (course && course.capacity.current > 0) {
      course.capacity.current -= 1;
      await course.save();
    }
  }

  // Remove old courses from registerCourses
  student.registerCourses = student.registerCourses.filter(
    (course) => !(course.semester === semester && course.yearLevel === yearLevel)
  );

  // Clear confirmation time
  student.confirmationStartTime = null;

  // Advance semester
  await student.advanceSemester();
  await student.save();

  console.log(`✅ الطالب ${student._id} تم نقله إلى: ${student.getYearLevel()} - ${student.getCurrentSemester()}`);
};

//-------------------------------------------------get Confirmed Courses-----------------------------------------------------------
export const getConfirmedCourses = async (req, res, next) => {
  try {
    const studentId = req.authUser._id;
    const student = await Student.findById(studentId).populate('confirmedCourses.course');
    if (!student) {
      return next(new AppError(messages.user.notFound, 404));
    }

    // Get all confirmed courses
    const confirmedCourses = student.confirmedCourses;

    // Group courses by semester and year
    const groupedCourses = confirmedCourses.reduce((acc, course) => {
      const key = `${course.yearLevel}-${course.semester}`;
      if (!acc[key]) {
        acc[key] = {
          yearLevel: course.yearLevel,
          semester: course.semester,
          courses: [],
          confirmedAt: course.confirmedAt
        };
      }
      acc[key].courses.push(course.course);
      return acc;
    }, {});

    // Convert to array and sort by year and semester
    const sortedGroups = Object.values(groupedCourses).sort((a, b) => {
      if (a.yearLevel !== b.yearLevel) {
        return a.yearLevel - b.yearLevel;
      }
      return a.semester - b.semester;
    });

    return res.status(200).json({
      success: true,
      confirmedCourses: sortedGroups,
      message: "المواد المؤكدة من الترمات السابقة"
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "خطأ في السيرفر" });
  }
};