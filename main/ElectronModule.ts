import LogHelper from './LogHelper'

export default class ElectronModule {

  constructor (private ModuleName: string) {
    process.on('message', async (Data) => {
      try {
        LogHelper.writeInfo(`Worker ${ModuleName} Run ${Data.Method}`)
        const MethodName = Data.Method.replace(`${this.ModuleName}:`, '')
        // @ts-ignore
        Data.Result = await this[MethodName](Data.Options)
        LogHelper.writeInfo(`Worker ${ModuleName} Run ${Data.Method} : ${JSON.stringify(Data.Result)}`)
      } catch (err) {
        LogHelper.writeErr(`Worker ${ModuleName} Run ${Data.Method} : ${err}`)
        Data.Error = err.toString()
      }
      this.SendMessage(Data)
    })
  }

  SendMessage<O, R> (Data: ToClientMessage<O, R>) {
    process.send && process.send(Data)
  }

}