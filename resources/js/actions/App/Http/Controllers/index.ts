import Auth from './Auth'
import WalletController from './WalletController'

const Controllers = {
    Auth: Object.assign(Auth, Auth),
    WalletController: Object.assign(WalletController, WalletController),
}

export default Controllers