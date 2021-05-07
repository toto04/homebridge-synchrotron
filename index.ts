import fetch from 'node-fetch'
import { AccessoryPlugin, API, Logging, PlatformConfig, StaticPlatformPlugin, HAP } from 'homebridge'

import { SynchrotronLight } from './light'

interface Light {
    name: string
    switchedOn: boolean
}

let hap: HAP

export default (api: API) => {
    hap = api.hap
    api.registerPlatform('Synchrotron', SynchrtronPlugin)
}

class SynchrtronPlugin implements StaticPlatformPlugin {
    log: Logging

    constructor(log: Logging, config: PlatformConfig, api: API) {
        this.log = log
        log.info('Synchrotron initialized!')
    }

    accessories = async (cb: (foundAccessories: AccessoryPlugin[]) => void) => {
        let res = await fetch('http://localhost:2077/lights')
        let lights: Light[] = await res.json()
        let accessories: AccessoryPlugin[] = []
        lights.forEach(light => {
            accessories.push(new SynchrotronLight(hap, this.log, light.name, light.switchedOn))
        })
        cb(accessories)
    }
}