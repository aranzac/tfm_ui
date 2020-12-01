import { Role } from './role';

export class User {
    username: string;
    email: string;
    password: string;
    enabled: boolean;
    roles: Role[];
}