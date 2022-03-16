App = {
    loading: false,
    contracts: {},

    load: async() => {
        if (typeof window.ethereum !== 'undefined') {
            console.log('MetaMask is installed!');
            await App.loadAccount();
            await App.loadContract();
            await App.render();
        } else {
            // if metamask isn't installed do something
        }
    },

    loadAccount: async () => {
        const account = await window.ethereum.request({ method: 'eth_requestAccounts' })
        .catch((e) => {
            console.error(e.message);
            return;
        })
        App.account = account[0];
        console.log(App.account);
    },

    loadContract: async() => {
        const todoList = await $.getJSON('build/contracts/TodoList.json'); // inside bs-config file we expose build contract directory so we have access to this file
        console.log(todoList);
        App.contracts.TodoList = TruffleContract(todoList);
        App.contracts.TodoList.setProvider(window.web3.currentProvider)
        App.todoList = await App.contracts.TodoList.deployed()
        .catch(() => {
            console.log("Failed to get contract")
            const loader = $('#loader');
            loader.html("Failed to load contract. Please download Ganache and deploy this smart contract to your local test network to demo!")
        });
    },

    render: async() => {
        if (App.loading) {
            return
        }
        App.toggleLoading(true);
        $('#account').html(App.account);

        // render tasks
        await App.renderTasks();

        App.toggleLoading(false);
    },

    renderTasks: async() => {
        const taskCount = await App.todoList.taskCount();
        const taskTemplate = $('.taskTemplate');

        for (let i = 1 ; i <= taskCount; i++) {
            // fetching task data from the blockchain for each task
            const task = await App.todoList.tasks(i);
            console.log(task);
            const taskId = task[0].toNumber();
            const taskContent = task[1];
            const taskCompleted = task[2];

            const newTaskTemplate = taskTemplate.clone();
            newTaskTemplate.find('.content').html(taskContent);
            newTaskTemplate.find('input')
            .prop('name', taskId)
            .prop('checked', taskCompleted)
            .on('click', App.toggleCompleted)

            if (taskCompleted) {
                $('#completedTaskList').append(newTaskTemplate);
            } else {
                $('#taskList').append(newTaskTemplate);
            }
            newTaskTemplate.show();
        }

    },

    createTask: async () => {
        App.toggleLoading(true);
        const content = $('#newTask').val();
        await App.todoList.createTask(content, {from: App.account})
        .catch(() => {
            console.error(e.message);
            return;
        });
        window.location.reload();
    },

    toggleCompleted: async (e) => {
        App.toggleLoading(true);
        const taskId = e.target.name
        await App.todoList.toggleCompleted(taskId, {from: App.account});
        window.location.reload();
    },

    toggleLoading: (boolean) => {
        App.loading = boolean;
        const loader = $('#loader');
        const content = $("#content");

        if (boolean) {
            loader.show();
            content.hide();
        } else {
            loader.hide();
            content.show();
        }
    }
}


$(() => {
    $(window).load(()=> {
        App.load()
    })
})