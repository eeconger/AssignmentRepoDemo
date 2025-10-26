"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const routes_1 = require("./routes");
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
dotenv_1.default.config();
exports.app = (0, express_1.default)();
// CORS configuration
exports.app.use(
  (0, cors_1.default)({
    origin: "http://localhost:3001",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
// Body parsing middleware
exports.app.use(express_1.default.json());
// Register routes
const routes = new routes_1.Routes();
routes.registerRoutes(exports.app);
const port = process.env.PORT || "3000";
exports.app.listen(port, () => {
  console.log(`Equanimity backend listening on port ${port}`);
});
//# sourceMappingURL=main.js.map
