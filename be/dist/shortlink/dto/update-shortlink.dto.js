"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateShortlinkDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_shortlink_dto_1 = require("./create-shortlink.dto");
class UpdateShortlinkDto extends (0, mapped_types_1.PartialType)(create_shortlink_dto_1.CreateShortlinkDto) {
}
exports.UpdateShortlinkDto = UpdateShortlinkDto;
//# sourceMappingURL=update-shortlink.dto.js.map