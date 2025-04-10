import { Router } from "express";
import * as courseService from './course.service.js'
import { asyncHandler } from "../../Middleware/asyncHandler.js";
import { isAuthentication } from "../../Middleware/authentication.js";
import { isAuthorization } from "../../Middleware/authorization.js";
import { roles } from "../../Utils/constant/enum.js";
const courseRouter = Router()

//add courses
courseRouter.post('/toggle-registration',isAuthentication(),isAuthorization([roles.USER]),asyncHandler(courseService.toggleRegistration))
//get register courses
courseRouter.get('/register-course',isAuthentication(),isAuthorization([roles.USER]),asyncHandler(courseService.registerCourse))
//get unregister courses
courseRouter.get('/unregister-course',isAuthentication(),isAuthorization([roles.USER]),asyncHandler(courseService.unRegisterCourses))
//get capacity
courseRouter.get('/capacity',isAuthentication(),isAuthorization([roles.USER]),asyncHandler(courseService.getCoursesWithCapacity))
//get all course
courseRouter.get('/all-course',asyncHandler(courseService.allCourse))
//get available Course
courseRouter.get('/available-course',isAuthentication(),isAuthorization([roles.USER]),asyncHandler(courseService.availableCourse))
//confirm Course
courseRouter.post('/confirm-course',isAuthentication(),isAuthorization([roles.USER]),asyncHandler(courseService.confirmCourse))
export default courseRouter