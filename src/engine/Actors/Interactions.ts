import {Response} from "detect-collisions"

import {Actor, EntityType} from "./ActorsBase.ts";

export class ActorInteractions {
    static dispatchCollision(response: Response) {
        const actor1 = response.a.userData as Actor;
        const actor2 = response.b.userData as Actor;
        if (actor1.entityType === actor2.entityType) {
            return;
        }

        if (actor1.entityType === EntityType.Player && actor2.entityType === EntityType.Enemy) {
            actor1.damage(1);
        }

    }
}