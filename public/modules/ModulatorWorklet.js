class ModulatorWorklet extends AudioWorkletProcessor {

    static get parameterDescriptors() {
        return [{name: 'modulation', defaultValue: 1, minValue: -1, maxValue: 1}];
    }

    constructor() {
        super();
    }

    process(inputList, outputList) {
        //console.log(inputList, outputList)
        //console.log(parameters.modulation)
        let sample = inputList[0][0]
        let modulator = inputList[1][0]
        let output = outputList[0][0]
        if (sample === undefined) {
            // console.log('no sample')
            return false
        }
        for (let i = 0; i < sample.length; i++) {
            // output[i] = sample[i]
            output[i] = sample[i] * modulator[i]
        }
        return true
    }
}
registerProcessor('modulator-worklet', ModulatorWorklet)