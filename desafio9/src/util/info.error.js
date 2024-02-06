export const generateUserRegErrorInfo=(data)=>{
    return`
    One or more fields in the registration proccess are empty or not valid.
    Items required:
    Name: String value, recived : ${data.name}.
    LastName: String value, recived: ${data.last_name}.
    Email: String value, recived: ${data.email}.
    Birthdate : Date value, recived:${data.age}.
    Password: String value, Must provide hidden for security reasons`
}
export const generateUserAgeErrorInfo=()=>{
    return `
    We are sorry you must be 18 years or older to use this aplication`
}
export const generateUserSesErrorInfo=()=>{
    return`
    The session has timedout due to inactivity please log in again.`
}
export const generateCartErrorInfo=()=>{
    return `
    Something went wrong getting the cart information:
    -Cart might be empty 
    -The User might not have a cart assosiated `
}
export const generateProductUpdateErrorInfo=(prod_info)=>{ 
    return `
    There has been an error with the request.
    Please verify that the ID provided is the correct and has no places at the end.
    ID provided: ${prod_info}`
}
export const generateRoutingErrorInfo=()=>{
    return `
    Acess denied, this route is not accessible with current user priviliges`
}
export const generateUserLogError=()=>{
    return `Email or password incorrect please try again`
}

export const generateDatabaseErrorInfo=()=>{
    return `There has been an error accessing the database.
    Please try again or check internet conection`
}