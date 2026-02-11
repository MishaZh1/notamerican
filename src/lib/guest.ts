import { v4 as uuidv4 } from 'uuid';

export const GUEST_COOKIE_NAME = 'guest_id';

export function generateGuestId(): string {
    return uuidv4();
}
