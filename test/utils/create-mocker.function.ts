import { InstanceToken } from "@nestjs/core/injector/module";

export function createMocker(dependencies: {[key: string]: any}) {
    return function(token: InstanceToken) {
        if (typeof token == "function" && typeof (token as any).name != "undefined") {
            return dependencies[(token as any).name];
        } else {
            return dependencies[token.toString()];
        }
    }
}