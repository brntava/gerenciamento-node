class UserController {

    constructor(formCreateEl, formUpdateEl, tableEl) {

        this.formEl = document.getElementById(formCreateEl);
        this.formUpdateEl = document.getElementById(formUpdateEl);
        this.tableEl = document.getElementById(tableEl);
        
        this.onSubmit();
        this.onEdit();
        this.selectAll();

    }

    //  Edit

    onEdit(){

        // Botao cancelar edit

        document.querySelector('#box-user-update .btn-default').addEventListener('click', () =>{

            this.showPanelCreate();

        })

        // Botao salvar o edit

        this.formUpdateEl.addEventListener('submit', e =>{
            e.preventDefault();
            
            let btn = this.formUpdateEl.querySelector('[type=submit]');

            btn.disabled = true;

            let values = this.getValues(this.formUpdateEl);

            let index = this.formUpdateEl.dataset.trIndex;

            let tr = this.tableEl.rows[index];

            // Pegar a img q o usuario ja selecionou

            let userOld = JSON.parse(tr.dataset.user);

            // Copia o valor dos atributos de um objeto

            let result = Object.assign({}, userOld, values)

            //

            this.getPhoto(this.formUpdateEl).then(
                (content) => {

                    if(!values.photo) {
                        result._photo = userOld._photo;
                    } else {
                        result._photo = content
                    }

                    let user = new User();

                    user.loadFromJSON(result);

                    user.save();

                    this.getTr(user, tr)

                    this.updateCount();
    
                    this.formUpdateEl.reset();
    
                    btn.disabled = false;

                    this.showPanelCreate();
                    
                },
                (e) =>{
                    console.error(e);
                })

        });
        
    }

    onSubmit() {

        this.formEl.addEventListener('submit', e =>{

            e.preventDefault();

            // Deixar o botao desabilitado

            let btn = this.formEl.querySelector('[type=submit]');

            btn.disabled = true;

            let values = this.getValues(this.formEl);

            if(!values) return false;

            // Retorno da promise

            this.getPhoto(this.formEl).then(
            (content) => {

                values.photo = content;

                values.save();

                this.addLine(values);

                this.formEl.reset();

                btn.disabled = false;
                
            },
            (e) =>{
                console.error(e);
            })

        })
    }

    // Pegar a foto

    getPhoto(formEl){

        return new Promise((resolve, reject) => {

        let fileReader = new FileReader();

        // Filtra a array e cria uma nova com os dados filtrados

        let elements = [...formEl.elements].filter(item => {

            if(item.name == 'photo'){
                return item;
            }

        })

        // Pega o primeiro elemento do form e o primeiro file

        let file = (elements[0].files[0]);

        // Quando terminar de carregar a img, executa essa funçao

        fileReader.onload = () => {

            resolve(fileReader.result)

        };

        // Se der erro

        fileReader.onerror = (e) => {

            reject(e);

        };

        if(file){

            fileReader.readAsDataURL(file);

        } else{

            resolve('dist/img/boxed-bg.jpg')
        }

        });

    }
    

    // Retorna o usuario

    getValues(formEl) {

        let user = {};
        let isValid = true;

        // ... quando não sabe quantos itens vao ter no array

        [...formEl.elements].forEach( (item, index) => {

            // Verifica se o itens estão vazios

            if(['name','email','password'].indexOf(item.name) > -1 && !item.value){

                item.parentElement.classList.add('has-error');
                isValid = false;

            }

            if(item.name == 'gender'){
        
                if(item.checked){
                    user[item.name] = item.value;
                }
        
            } else if(item.name == 'admin'){

                user[item.name] = item.checked;

            }else{
                // Colocar o valor dentro do user
                user[item.name] = item.value
            }
        });

        if(!isValid){
            return false;
        };
    
        return new User(
            user.name,
            user.gender,
            user.birth,
            user.country,
            user.email,
            user.password,
            user.photo,
            user.admin
        );

    }


    selectAll(){

        let users = User.getUsersStorage();

        users.forEach( item => {

            let user = new User();

            user.loadFromJSON(item);

            this.addLine(user);

        })
        
    }

    // Adiciona as informações

    getTr(dataUser, tr = null){

        if(tr === null) tr = document.createElement('tr');

        tr.dataset.user = JSON.stringify(dataUser);

        tr.innerHTML = `
            <td> <img src="${dataUser.photo}" alt="User Image" class="img-circle img-sm"></td>
            <td>${dataUser.name}</td>
            <td>${dataUser.email}</td>
            <td>${(dataUser.admin) ? 'Sim' : 'Não'}</td>
            <td>${Utils.dateFormat(dataUser.register)}</td>
            <td>
            <button type="button" class="btn btn-primary btn-edit btn-xs btn-flat">Editar</button>
            <button type="button" class="btn btn-danger btn-delete btn-xs btn-flat">Excluir</button>
            </td>
        `;

        this.addEventsTr(tr);

        return tr;

    }

    addLine(dataUser){

        let tr = this.getTr(dataUser);
    
        this.tableEl.appendChild(tr);

        this.updateCount();
    
    }

    // Editar

    addEventsTr(tr){

        tr.querySelector('.btn-delete').addEventListener('click', () =>{

                if(confirm("Deseja realmente excluir?")){

                    let user = new User();
                    
                    user.loadFromJSON(JSON.parse(tr.dataset.user));

                    user.remove();

                    tr.remove();
                    this.updateCount();
                };

        });

        tr.querySelector('.btn-edit').addEventListener('click', () =>{

            let json = JSON.parse(tr.dataset.user);

            // Começa a contagem do 0
            this.formUpdateEl.dataset.trIndex = tr.sectionRowIndex;

            // Preencher os dados quando clicar em editar

            for(let name in json){

                // Troca o _ do item para nada 
                let field = this.formUpdateEl.querySelector("[name = " + name.replace('_', '')+ "]");

                // Vai preenchendo o valor do name conforme percorre o for
                if(field){

                    switch(field.type){

                        case 'file':
                            continue;
                            break;

                        case 'radio':
                            field = this.formUpdateEl.querySelector("[name= " + name.replace('_', '')+ "][value="+json[name]+"]");
                            field.checked = true;
                            break;

                        case 'checkbox':
                            field.checked = json[name];
                            break

                        default:
                            field.value = json[name];

                    };

                };

            }

            this.formUpdateEl.querySelector('.photo').src = json._photo;

            this.showPanelUpdate();

        });
    }


    showPanelCreate(){
        document.querySelector('#box-user-create').style.display = 'block';
        document.querySelector('#box-user-update').style.display = 'none'; 
    }


    showPanelUpdate(){
        document.querySelector('#box-user-create').style.display = 'none';
        document.querySelector('#box-user-update').style.display = 'block'; 
    }

    updateCount(){

        let numberUsers = 0;
        let numberAdmin = 0;

        [...this.tableEl.children].forEach((tr) =>{

            numberUsers++;

            let user = JSON.parse(tr.dataset.user);

            // Se o admin for true add mais um
            if(user._admin) numberAdmin++;

        });

        document.getElementById('users-number').innerHTML = numberUsers;
        document.getElementById('users-numbers-admin').innerHTML = numberAdmin;

    }

}