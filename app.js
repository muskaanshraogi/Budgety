var budgetController = (function(){
    
    var Expense = function(id,description,value){
        this.id=id;
        this.description=description;
        this.value=value;
    };
    
    var Income = function(id,description,value){
        this.id=id;
        this.description=description;
        this.value=value;
    };
    
    var calculateTotal = function(type){
        var sum = 0;
        data.allItems[type].forEach(function(cur){
            sum = sum + cur.value;
        });
        data.totals[type] = sum;
    }
    
    var data = {
        allItems: {
            inc: [],
            exp: []
        },
        totals: {
            inc: 0,
            exp: 0
        },
        budget: 0,
        percentage: -1
    };
    
    return{

        addToList: function(type,des,val){
            var newItem,ID;
            
            if(data.allItems[type].length > 0){
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }
            
            if(type === 'exp'){
                newItem = new Expense(ID, des, val);
            } else if(type === 'inc'){
                newItem = new Income(ID, des, val);
            }
            
            data.allItems[type].push(newItem);
            return newItem;
        },
        
        deleteFromList: function(type,id){
            var ids,index;
            
            ids = data.allItems[type].map(function(current){
                return current.id;
            });
            index = ids.indexOf(id);
            
            if(index !== -1){
                data.allItems[type].splice(index,1);
            }
        },
        
        calculateBudget: function(type){
            
            calculateTotal('inc');
            calculateTotal('exp');
            
            data.budget = data.totals.inc - data.totals.exp;
            
            if(data.totals.inc >= data.totals.exp){
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            }
        },
        
        getBudget: function(){
            
            return{
                budget: data.budget,
                income: data.totals.inc,
                expenses: data.totals.exp,
                percentage: data.percentage
            }
        },
        
        testing: function(){
            console.log(data);
        }
        
    } 
})();

var UIController = (function(){
    
    var DOMstrings = {
        inputValue: '.add__value',
        inputDes: '.add__description',
        inputType: '.add__type',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        expensesPercent: '.budget__expenses--percentage',
        container: '.container',
        dateLabel: '.budget__title--month'
    };
    
    return{
        getInput: function(){
            return{
                type: document.querySelector(DOMstrings.inputType).value,
                description: document.querySelector(DOMstrings.inputDes).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
                
        },
        
        getStrings: function(){
            return DOMstrings;
        },
        
        addItemtoUI: function(obj, type){
            var html,newHtml,element;
            
            if(type === 'exp'){
                element = DOMstrings.expenseContainer;
                
                html = '<div class="item clearfix" id="exp-%ID%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            } else if(type === 'inc'){
                element = DOMstrings.incomeContainer;
                
                html = '<div class="item clearfix" id="inc-%ID%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }
            
            newHtml = html.replace('%ID%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', obj.value);
            
            document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);
        },
        
        deleteItemFromUI: function(selectorId){
            var el = document.getElementById(selectorId);
            el.parentNode.removeChild(el);
        },
        
        clearFields: function(){
            
            document.querySelector(DOMstrings.inputDes).value = "";
            document.querySelector(DOMstrings.inputValue).value = "";
        },
        
        displayBudget: function(obj){
            
            document.querySelector(DOMstrings.budgetLabel).textContent = obj.budget;
            document.querySelector(DOMstrings.incomeLabel).textContent = obj.income;
            document.querySelector(DOMstrings.expensesLabel).textContent = obj.expenses;
            
            if(obj.percentage > 0){
                document.querySelector(DOMstrings.expensesPercent).textContent = obj.percentage + '%';
            } else{
                document.querySelector(DOMstrings.expensesPercent).textContent = '--';
            }
            
        },
        
        displayMonth: function(){
            var now,year,month;
            
            var Months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            
            now = new Date();
            year = now.getFullYear();
            
            document.querySelector(DOMstrings.dateLabel).textContent = year;
        }
        
    }

    
})();

var controller = (function(budgetCtrl, UICtrl){
    
    var setupEventListeners = function(){
        
        var DOM = UICtrl.getStrings();
       
        
        document.querySelector(DOM.inputBtn).addEventListener('click', addItem);
        document.addEventListener('keypress', function(event){
        
        if(event.keyCode === 13 || event.which === 13){
                addItem();
            }
            
    });
        document.querySelector(DOM.container).addEventListener('click',deleteItem);
        
    };
    
    var updateBudget = function(){
        
        budgetCtrl.calculateBudget();
        var budget = budgetCtrl.getBudget();
        UICtrl.displayBudget(budget);
    };
    
    var updatePercentages = function(){
        
    };
    
    var addItem = function(){
        
        var input = UICtrl.getInput();
        
        if(input.description != "" && !isNaN(input.value) && input.value > 0){
            var item = budgetCtrl.addToList(input.type, input.description, input.value);
            UICtrl.addItemtoUI(item, input.type);
            UICtrl.clearFields();
            updateBudget();
            updatePercentages();
        }
        
    };
    
    var deleteItem =function(event){
        var itemID,splitID,type,ID;
        
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        if(itemID){
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);
            
            budgetCtrl.deleteFromList(type,ID);
            UICtrl.deleteItemFromUI(itemID);
            updateBudget();
            updatePercentages();
        }
    }
    
    return{
        init: function(){
            UICtrl.displayBudget({
                budget: 0,
                income: 0,
                expenses: 0,
                percentage: -1
            });
            setupEventListeners();
            UICtrl.displayMonth();
        }
    };
    
})(budgetController, UIController);

controller.init();