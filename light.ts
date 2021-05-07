import fetch from 'node-fetch'
import { AccessoryPlugin, HAP, Logging, Service, CharacteristicEventTypes } from 'homebridge'

export class SynchrotronLight implements AccessoryPlugin {
    private on: boolean
    log: Logging
    name: string

    service: Service
    info: Service

    constructor(hap: HAP, log: Logging, name: string, initialState: boolean) {
        this.on = initialState
        this.log = log
        this.name = name

        this.service = new hap.Service.Lightbulb(name)
        this.service.getCharacteristic(hap.Characteristic.On)
            .on(CharacteristicEventTypes.GET, async cb => {
                let res = await fetch('http://localhost:2077/lights/' + name)
                let { switchedOn }: { switchedOn: boolean } = await res.json()
                this.on = switchedOn
                cb(undefined, this.on)
            })
            .on(CharacteristicEventTypes.SET, async (val, cb) => {
                this.on = val as boolean
                await fetch('http://localhost:2077/lights/' + name + '/switch', {
                    method: 'post',
                    headers: { 'Content-type': 'application/json' },
                    body: JSON.stringify({ on: this.on })
                })
                log.info('changed state to ' + (this.on ? 'on' : 'off'))
                cb()
            })
        this.info = new hap.Service.AccessoryInformation()
            .setCharacteristic(hap.Characteristic.Manufacturer, 'Tommaso Morganti')
            .setCharacteristic(hap.Characteristic.Model, 'Synchrotron Device')

        log.info("device online: " + name)
    }
    getServices = () => [this.service, this.info]
}