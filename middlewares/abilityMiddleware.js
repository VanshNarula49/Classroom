const { subject } = require('@casl/ability');
const defineAbilitiesFor = require('../utils/caslAbility');
const getCourseRole = require('../utils/getCourseRole');

const checkAbilityForResource = (action, subjectType, resourceLoader) => {
  return async (req, res, next) => {
    try {
      const resource = await resourceLoader(req);
      if (!resource) {
        return res.status(404).json({ message: 'Resource not found' });
      }

      // Identify the course context (if any)
      let courseContext = resource.course || (subjectType === 'Course' ? resource : null);
      
      // Dynamically augment the user with course role, if needed
      let augmentedUser = req.user;
      if (courseContext) {
        const courseRole = getCourseRole(req.user, courseContext);
        if (!courseRole) {
       throw ({ status: 403, message: 'No Role in this Course', origin: 'Authorization Middleware' });
        }
        augmentedUser = { ...req.user, courseRole };
      }

      const ability = defineAbilitiesFor(augmentedUser);
      // CASL check using subject type and resource
      const caslSubject = subject(subjectType, resource);
      if (!ability.can(action, caslSubject)) {
        throw ({ status: 403, message: 'Action not permitted for this user', origin: 'Authorization Middleware' });

      }

      req.resource = resource; // Attach resource to the request for further processing
      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = checkAbilityForResource;
