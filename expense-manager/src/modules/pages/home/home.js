import { LightningElement } from 'lwc';
import LightningConfirm from 'lightning/confirm';
import {categoryList} from './categoryList'
const BACKEND_URL = 'http://localhost:3002'
const ADD_ACTION = 'ADD'
const EDIT_ACTION = 'EDIT'
export default class Home extends LightningElement{
    backendUrl = BACKEND_URL
    expenseRecords =[]
    categoryTableData=[]
    chartData
    showModal = false
    formData={}
    action
    loggedInUser
    showSpinner = false

    //Define a getter for category options
    get categoryOptions(){
        return categoryList
    }

    //Define a getter that sets the modal label
    get modalActionLabel(){
        return this.action === EDIT_ACTION ? 'Edit Expense' : 'Add Expense'
    }


    async connectedCallback(){
        try{
            const user = await this.getLoggedInUser()
            console.log("user info", user)
            if(!user.user_id){
                window.location.href = '/login'
            } else {
                this.loggedInUser = user
                await this.fetchExpenseData()
            }
            
        } catch(error){
            console.error("response error", error)
        }
      
    }
    async fetchExpenseData(){
                const expenses = await this.getExpenses()
                console.log("expenses", expenses)
                this.expenseRecords = expenses.totalSize > 0 ? expenses.records :[]
                this.createChartData()
    }

    //Method to get logged-in user data

    async getLoggedInUser(){
        const url = `${BACKEND_URL}/oauth2/whoami`
        return await this.makeApiRequest(url)
    }

    //Method to get Expenses data
    async getExpenses(){
        const url = `${BACKEND_URL}/expenses`
        return await this.makeApiRequest(url)
    }

    //Generic API Method
    async makeApiRequest(url, method = 'GET', data=null){
        try{
            this.showSpinner = true
            const requestOptions = {
                method,
                headers:{
                    'Content-Type':'application/json'
                },
                body:data ? JSON.stringify(data):null
            }
            const response = await fetch(url, requestOptions)
            if(!response.ok){
                throw new Error(response.statusText)
            }
            return response.json()
        }catch(error){
            console.log("Error Occurred", error)
        } finally{
            this.showSpinner = false
        }

    }

    //edit row handler
    editHandler(event){
        this.action= EDIT_ACTION
        this.showModal = true
        this.formData = {...event.detail}
        console.log(event.detail)
    }
    //delete row handler
    deleteHandler(event){
        console.log(event.detail)
        const url = `${BACKEND_URL}/expenses/${event.detail.Id}`
        this.handleConfirmClick(url)
    }
    // Method to make a confirmation dialog for delete action
    async handleConfirmClick(url) {
        const result = await LightningConfirm.open({
            message: 'Are you sure you want to delete',
            variant: 'header',
            label: 'Confirmation',
            theme:'error'
        });
        if(result){
            const response = await this.makeApiRequest(url,'DELETE')
            console.log("deleted record")
            if(response.id){
                await this.fetchExpenseData()
            }
        }
    }
  // Method to create chart data based on expenses
    createChartData(){
        const categorySums = {}

        this.expenseRecords.forEach(item=>{
            const {Amount__c,Category__c} = item
            // Check if the category already exists in the sums object
            if(categorySums[Category__c]){
                categorySums[Category__c] += Amount__c
            } else {
                categorySums[Category__c] = Amount__c
            }
        })
        console.log("categorySums", categorySums)
        this.categoryTableData = Object.keys(categorySums).map((item,index)=>{
            return ({
                "id":index+1,
                "category":item,
                "amount":this.formatCurrency(categorySums[item])
            })
        })
        console.log(" this.categoryTableData ",  this.categoryTableData )
        this.chartData = {
            labels:Object.keys(categorySums),
            results:Object.values(categorySums)
        }
    }

    formatCurrency(number){
        return number.toLocaleString('en-US', {
            style:'currency',
            currency:'USD'
        })
    }

    //Modal Cancel Handler
    cancelHandler(){
        console.log("Cancel Clicked")
        this.showModal = false
        this.action= null
    }

    //Modal Save Handler
    saveHandler(){
      
        if(this.isFormValid()){
            // this.showModal = false
            if(this.formData.Id){
                console.log("Save Clicked success for Update", this.formData)
                const url = `${BACKEND_URL}/expenses/${this.formData.Id}`
                this.addAndUpdateHandler(url, 'PUT')
            } else {
                console.log("Save Clicked success for Add", this.formData)
                const url = `${BACKEND_URL}/expenses`
                this.addAndUpdateHandler(url, 'POST')
            }
            
        } else {
            console.log("Save Clicked Validation failed")
        }
        
    }

    //Method to handle adding and updating of expenses
    async addAndUpdateHandler(url, method){
       const response =  await this.makeApiRequest(url, method, this.formData)
       if(response.id){
        await this.fetchExpenseData()
        this.showModal = false
        this.action= null
       }

    }

    // Add Expense Handler
    addExpense(){
        this.showModal  = true
        this.formData={}
        this.action= ADD_ACTION
    }

    //form change handler
    changeHandler(event){
    //    const name = event.target.name  //Expense_Name__c
    //    const value = event.target.value //utility
        const {name, value} = event.target
        this.formData={...this.formData, [name]:value}
    }

    //form Validation handler
    isFormValid(){
        let isValid = true
       let inputFields = this.template.querySelectorAll('.validate')
       inputFields.forEach(inputField=>{
        if(!inputField.checkValidity()){ 
            inputField.reportValidity()
            isValid = false
        }
       })
       return isValid
    }
}