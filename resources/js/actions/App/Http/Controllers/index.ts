import Auth from './Auth'
import GroupController from './GroupController'
import GroupMemberController from './GroupMemberController'
import WalletController from './WalletController'

const Controllers = {
    Auth: Object.assign(Auth, Auth),
    GroupController: Object.assign(GroupController, GroupController),
    GroupMemberController: Object.assign(GroupMemberController, GroupMemberController),
    WalletController: Object.assign(WalletController, WalletController),
}

export default Controllers