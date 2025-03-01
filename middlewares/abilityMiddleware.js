// /middlewares/checkAbility.js
const { subject } = require('@casl/ability');
const defineAbilitiesFor = require('../utils/caslAbility');
const getCourseRole = require('../utils/getCourseRole');

const checkAbilityForResource = (action, subjectType, resourceLoader) => {
  return async (req, res, next) => {
    try {
      let resource = await resourceLoader(req);
      if (!resource) {
        return res.status(404).json({ message: 'Resource not found' });
      }
      
      if (subjectType) {
        resource = subject(subjectType, resource);
      }
      
      // If the resource is course-specific (either it's a Course or has a nested course)
      let courseContext = null;
      if (subjectType === 'Course') {
        courseContext = resource;
      } else if (resource && resource.course) {
        courseContext = resource.course;
      }
      
      let augmentedUser = req.user;
      if (courseContext) {
        const courseRole = getCourseRole(req.user, courseContext);
        if (!courseRole) {
          return res.status(403).json({ message: 'Forbidden: You have no role in this course' });
        }
        augmentedUser = { ...req.user, courseRole };
      }
      
      const ability = defineAbilitiesFor(augmentedUser);
      if (!ability.can(action, resource)) {
        return res.status(403).json({ message: 'Forbidden: You are not allowed to perform this action' });
      }
      
      req.resource = resource;
      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = checkAbilityForResource;
