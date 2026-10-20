const cl = console.log;
const spinner = document.getElementById("spinner");
const todoContainer = document.getElementById("todoContainer");
const form = document.getElementById("form");
const todoControl = document.getElementById("todos");
const addBtn = document.getElementById("addBtn");
const  updateBtn= document.getElementById("updateBtn");

//url 
const BASE_URL = "https://fetch-api-crud-e52ad-default-rtdb.asia-southeast1.firebasedatabase.app"
const todo_url = `${BASE_URL}/todo12.json`
//snackBar
function snackBar(msg, icon){
    Swal.fire({
        text :msg,
        icon:icon,
        timer:2500
    })
}
//spinner
function showSpinner(){
 spinner.classList.remove("d-none");
}

//hide
function hideSpinner(){
 spinner.classList.add("d-none");
}
//state 
const state = {
    todoArr : [],
    edit_id : null
}
//generic function 
function makeApiCall(url, methodtype, msgbody = null){
    let body = msgbody? JSON.stringify(msgbody) : null;
   return fetch(url,{
       method:methodtype,
       body:body,
       headers:{
        "content-type":"application/json",
        "authorization":"JWT TOKEN"
       }
    })
    .then((res)=>{
        if(!res.ok){ 
           throw new Error("something went wrong"); 
        }
        return res.json();
    })
    .catch((err)=>{
       snackBar(err.msg,"error") 
    })
    .finally(()=>{
        hideSpinner();
    })
}

//read
function showOnUi(){
showSpinner();
makeApiCall(todo_url,"GET")
 .then((data)=>{
    for(const key in data){
     data[key].id = key;
     state.todoArr.push(data[key])
     cl(state.todoArr)
    }
    templeting(state.todoArr);
})
.catch((err)=>{
    snackBar(err.message,"error")
})
}

function templeting(arr){
    let result = ``;
    arr.forEach(ele => {
       result += `<li class="list-group-item d-flex justify-content-between" id="${ele.id}">
                        <strong>${ele.todoItem}</strong>
                        <div>
                            <button onclick="onEdit(this)" class="btn btn-sm btn-outline-primary">Edit</button>
                            <button onclick="onRemove(this)" class="btn btn-sm btn-outline-danger">Remove</button>
                        </div>
                    </li>`
              
    });
     todoContainer.innerHTML = result; 
}
showOnUi();

//create

function onAddTodo(eve){
    eve.preventDefault();
    let new_obj ={
        todoItem:todoControl.value
    }
  showSpinner();
  makeApiCall(todo_url,"POST",new_obj)
  .then((data)=>{
    new_obj.id = data.name;
    state.todoArr.push(new_obj);
    let li = document.createElement("li");
    li.id = data.name;
    li.className = "list-group-item d-flex justify-content-between";
    li.innerHTML = `<strong>${new_obj.todoItem}</strong>
                        <div>
                            <button onclick="onEdit(this)" class="btn btn-sm btn-outline-primary">Edit</button>
                            <button onclick="onRemove(this)" class="btn btn-sm btn-outline-danger">Remove</button>
                        </div>`
  todoContainer.append(li);
  form.reset();
  snackBar("todo is added successfully","success");
  })  
}

//edit 
function onEdit(ele){
    let edit_id = ele.closest("li").id;
state.edit_id = edit_id;
let edit_obj = state.todoArr.find(obj=> obj.id === edit_id);
todoControl.value = edit_obj.todoItem;
addBtn.classList.add("d-none");
updateBtn.classList.remove("d-none");
}
//update
function onUpdate(ele){
    let update_id =state.edit_id;
    let update_url = `${BASE_URL}/todo12/${update_id}.json`
    let updated_obj ={
        id:update_id,
        todoItem : todoControl.value
    }
   showSpinner();
   makeApiCall(update_url,"PATCH",updated_obj)
   .then((data)=>{
      let getIndex = state.todoArr.findIndex(obj=> obj.id === update_id);
      state.todoArr[getIndex] = updated_obj;
      let li = document.getElementById(update_id);
      li.innerHTML = `<strong>${updated_obj.todoItem}</strong>
                        <div>
                            <button onclick="onEdit(this)" class="btn btn-sm btn-outline-primary">Edit</button>
                            <button onclick="onRemove(this)" class="btn btn-sm btn-outline-danger">Remove</button>
                        </div>`
        form.reset();
        updateBtn.classList.add("d-none");
        addBtn.classList.remove("d-none");
        snackBar("todo is updated successfully","success");
   }) 
   .catch((err)=>{
    snackBar(err.message,"error")
   })
}

//delete
function onRemove(ele){
Swal.fire({
  title: "Are you sure?",
  text: "You won't be able to revert this!",
  icon: "warning",
  showCancelButton: true,
  confirmButtonColor: "#3085d6",
  cancelButtonColor: "#d33",
  confirmButtonText: "Yes, delete it!"
}).then((result) => {
  if (result.isConfirmed) {
    let remove_id = ele.closest("li").id;
    let remove_url = `${BASE_URL}/todo12/${remove_id}.json`;
    showSpinner();
    makeApiCall(remove_url,"DELETE")
    .then((data)=>{
        let getIndex = state.todoArr.findIndex(obj => obj.id === remove_id);
        state.todoArr.splice(getIndex,1);
        ele.closest("li").remove();
        snackBar("todo is deleted successfully","success");
    })
  }
});
}

updateBtn.addEventListener("click",onUpdate);
form.addEventListener("submit",onAddTodo);
