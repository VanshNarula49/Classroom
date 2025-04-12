// /middlewares/abilityMiddleware.js

const { subject } = require('@casl/ability');
const defineAbilitiesFor = require('../utils/caslAbility');
const getCourseRole = require('../utils/getCourseRole');

const checkAbilityForResource = (action, subjectType, resourceLoader) => {
  return async (req, res, next) => {
    try {
      console.log('\n[DEBUG] --- checkAbilityForResource START ---');
      console.log('[DEBUG] action:', action, '| subjectType:', subjectType);

      // 1) Load the resource via resourceLoader
      const resource = await resourceLoader(req);
      console.log('[DEBUG] Loaded resource:', JSON.stringify(resource, null, 2));

      if (!resource) {
        console.log('[DEBUG] Resource is null or undefined => 404');
        return res.status(404).json({ message: 'Resource not found' });
      }

      // 2) Identify course context
      let courseContext = resource.course || (subjectType === 'Course' ? resource : null);
      console.log('[DEBUG] courseContext:', JSON.stringify(courseContext, null, 2));

      // 3) Possibly augment the user with the courseRole
      let augmentedUser = req.user;
      console.log('[DEBUG] Original req.user:', JSON.stringify(req.user, null, 2));

      if (courseContext) {
        console.log('[DEBUG] Attempting to determine courseRole via getCourseRole()...');
        const courseRole = getCourseRole(req.user, courseContext);
        console.log('[DEBUG] Resulting courseRole:', courseRole);

        if (!courseRole) {
          console.log('[DEBUG] This user is not affiliated => 403');
          throw {
            status: 403,
            message: 'No Role in this Course',
            origin: 'Authorization Middleware'
          };
        }

        augmentedUser = { ...req.user, courseRole };
        console.log('[DEBUG] augmentedUser:', JSON.stringify(augmentedUser, null, 2));
      }

      // 4) Build CASL Ability
      console.log('[DEBUG] Building CASL ability for augmentedUser...');
      const ability = defineAbilitiesFor(augmentedUser);

      // 5) CASL check
      const caslSubject = subject(subjectType, resource);
      console.log('[DEBUG] Checking can(%s, %s)...', action, subjectType);

      if (!ability.can(action, caslSubject)) {
        console.log('[DEBUG] ability.can() returned false => 403');
        throw {
          status: 403,
          message: 'Action not permitted for this user',
          origin: 'Authorization Middleware'
        };
      }

      console.log('[DEBUG] Permission granted! Attaching resource to req, moving on.');
      req.resource = resource;
      next();
    } catch (error) {
      console.log('[DEBUG] Error caught:', error);
      next(error);
    }
  };
};

module.exports = checkAbilityForResource;
