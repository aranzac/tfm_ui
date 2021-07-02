import { Role } from './role';

export class User {
    id: number;
    username: string;
    email: string;
    password: string;
    enabled: boolean;
    roles: Role[];
}