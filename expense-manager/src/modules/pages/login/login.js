import {LightningElement} from 'lwc';
const BACKEND_URL = "http://localhost:3002"
export default class Login extends LightningElement {
    get loginUrl(){
        return `${BACKEND_URL}/oauth2/login`
    }
}