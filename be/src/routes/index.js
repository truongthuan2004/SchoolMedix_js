// index.js

import postRoutes from "./post.routes.js";
import userRoutes from "./users.routes.js";
import diseaseRoutes from "./disease.routes.js";


const router = express.Router();

router.use("/", postRoutes);
router.use("/", userRoutes);
router.use("/", diseaseRoutes);

export default router;

