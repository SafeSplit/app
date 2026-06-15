import Auth from './Auth'
import GroupController from './GroupController'
import NetworkController from './NetworkController'
import GroupMemberController from './GroupMemberController'
import ExpenseController from './ExpenseController'
import ExpenseSplitController from './ExpenseSplitController'
import SettlementController from './SettlementController'
import EventSignatureController from './EventSignatureController'
import WalletController from './WalletController'

const Controllers = {
    Auth: Object.assign(Auth, Auth),
    GroupController: Object.assign(GroupController, GroupController),
    NetworkController: Object.assign(NetworkController, NetworkController),
    GroupMemberController: Object.assign(GroupMemberController, GroupMemberController),
    ExpenseController: Object.assign(ExpenseController, ExpenseController),
    ExpenseSplitController: Object.assign(ExpenseSplitController, ExpenseSplitController),
    SettlementController: Object.assign(SettlementController, SettlementController),
    EventSignatureController: Object.assign(EventSignatureController, EventSignatureController),
    WalletController: Object.assign(WalletController, WalletController),
}

export default Controllers