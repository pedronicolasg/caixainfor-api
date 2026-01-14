import { IsBoolean, IsOptional } from "class-validator";

export class ToggleRegistrationDto {
  @IsBoolean()
  @IsOptional()
  enabled?: boolean;
}
