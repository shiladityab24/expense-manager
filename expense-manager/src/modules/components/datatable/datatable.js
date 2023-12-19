import {LightningElement ,api} from 'lwc'
const ACTIONS = [
    {label:'Edit',name:'edit'},
    {label:'Delete',name:'delete'}
]
const COLUMNS = [
    {label:"Name",type:'text',fieldName:'Expense_Name__c',hideDefaultActions: true},
    {label:"Amount",type:'currency',fieldName:'Amount__c',cellAttributes:{alignment:'left'},
typeAttributes:{currencyCode:'USD',step:'0.001'},hideDefaultActions: true},
    {label:"Expense Date",type:'date',fieldName:'Date__c',hideDefaultActions: true},
    {label:"Category",type:"text",fieldName:'Category__c',hideDefaultActions: true},
    {label:"Notes",type:'text',fieldName:'Notes__c',hideDefaultActions: true},
    {
        type:'action',
        typeAttributes:{
            rowActions:ACTIONS
        }
    }
]
export default class Datatable extends LightningElement{
    _data = []
    keyField = 'Id'
    columns = COLUMNS
    @api
    set records(result){
        this._data = [...result]
    }
    get records(){
        return this._data
    }
    handleRowAction(event){
        const actionName = event.detail.action.name
        console.log(event.detail.action.name)
        const row = event.detail.row
        console.log(row)
        if(actionName === 'edit'){
            const newEvent = new CustomEvent('edit',{
                detail:row
            })
            this.dispatchEvent(newEvent)
        }else if(actionName === 'delete'){
            const newEvent = new CustomEvent('delete',{
                detail:row
            })
            this.dispatchEvent(newEvent)
        }else{

        }
    }
}
