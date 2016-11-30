//  BUDGET CONTROLLER
var budgetController = (function() {

  var Expense = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    //  not defined, so -1
    this.percentage = -1;
  };

  Expense.prototype.calcPercentage = function(totalIncome) {

    if (totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100)
    } else {
      this.percentage = -1;
    }
  };

  Expense.prototype.getPercentage = function() {
    return this.percentage;
  };

  var Income = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  var calculateTotal = function(type) {
    var sum = 0;
    data.allItems[type].forEach(function(current) {
      sum += current.value;
    });
    data.totals[type] = sum;
  };



  // var allExpenses = [];
  // var allIncomes = [];
  // var totalExpenses = 0;
  // MADE MORE EFFICIENT
  var data = {
    allItems: {
      exp: [],
      inc: []
    },
    totals: {
      exp: 0,
      inc: 0
    },
    budget: 0,
    percentage: -1 //using -1 to indicate non-existant
  };

  return {
    addItem: function (type, des, val) {
      var newItem, ID;

      //  create new unique ID
      if (data.allItems[type].length > 0) {
      ID = data.allItems[type][data.allItems[type].length -1].id + 1;
      } else {
        ID = 0;
      }
      // create new item bases on 'inc' or 'exp'
      if (type === 'exp') {
        newItem = new Expense(ID, des, val)
      } else if (type === 'inc') {
        newItem = new Income(ID, des, val)
      }

      // push item into data structure
      data.allItems[type].push(newItem)

      //return new element
      return newItem;

    },

    deleteItem(type, id) {
      var ids, index;

      //  map returns new array
      var ids = data.allItems[type].map(function(current) {
        return current.id
      });

      index = ids.indexOf(id);

      if (index !== -1) {
        data.allItems[type].splice(index, 1)
      }
    },

    calculateBudget: function() {
      //  calculate total income & expenses__list
      calculateTotal('exp');
      calculateTotal('inc')
      //  calculate budget: income - expenses__list
      data.budget = data.totals.inc - data.totals.exp
      //  calcualte percentage of income that was spent
      if (data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.percentage = -1;
      }
    },

    calculatePercentages: function(current) {
      data.allItems.exp.forEach(function(current) {
        current.calcPercentage(data.totals.inc);
      });
    },

    getPercentages: function() {
      var allPerc = data.allItems.exp.map(function(current) {
        return current.getPercentage();
      });
      return allPerc;
    },

    getBudget: function() {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage
      }
    },

    testing: function ()  {
      console.log(data);
    }

  }


})();




//  UI CONTROLLER
var UIController = (function () {
  var DOMstrings = {
    inputType: '.add__type',
    inputDescription: '.add__description',
    inputValue: '.add__value',
    inputBtn: '.add__btn',
    incomeContainer: '.income__list',
    expensesContainer: '.expenses__list',
    budgetLabel: '.budget__value',
    incomeLabel: '.budget__income--value',
    expensesLabel: '.budget__expenses--value',
    percentageLabel: '.budget__expenses--percentage',
    container: '.container',
    expensesPercLabel: '.item__percentage',
    dateLabel: '.budget__title--month'
  };

  var formatNumber = function (num, type) {
    var numSplit;

    num = Math.abs(num);
    num = num.toFixed(2);

    numSplit = num.split('.');

    int = numSplit[0];
    if (int.length > 3) {
      int = int.substr(0, int.length - 3) + ',' + int.substr(int.length -3, 3);
    }

    dec = numSplit[1];


    return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;

  };

  var nodeListForEach = function(list, callback) {
    for (var i = 0; i < list.length; i++) {
      callback(list[i], i);
    }
  };

  return {
    getInput: function () {
        return {
           type: document.querySelector(DOMstrings.inputType).value, //  with be either 'inc' or 'exp' (see HTML)
           description: document.querySelector(DOMstrings.inputDescription).value,
           value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
        };
      },

      addListItem: function(obj, type) {
        var html, newHtml, element;
        //  create HTML string w/ placeholder text
        if (type === 'inc') {
          element = DOMstrings.incomeContainer;


          html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';

        } else if (type === 'exp'){
          element = DOMstrings.expensesContainer;
          html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
        }

        // replace placeholder text w/ sactual data
        newHtml = html.replace('%id%', obj.id);
        newHtml = newHtml.replace('%description%', obj.description);
        newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

        //insert HTML into DOM
        document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

      },

      deleteListItem: function(selectorID) {

        var el = document.getElementById(selectorID)
        el.parentNode.removeChild(el)
      },

      clearFields: function () {
        var fields, fieldsArr;

        //  note querySelectorAll returns a list NOT an array
        fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue)

        //  trick slice method into returning an array with 'the' array function-constructor for all arrays
        fieldsArr = Array.prototype.slice.call(fields);

        //  can receive up to 3 arguments, loops over all fields, and sets value to empty
        fieldsArr.forEach(function(current, index, array) {
           current.value = "";
        });

        fieldsArr[0].focus();
      },

      displayBudget: function(obj) {
        var type;
        obj.budget > 0 ? type = 'inc' : type = 'exp';

        document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
        document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
        document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');

        if (obj.percentage > 0) {
          document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
        } else {
          document.querySelector(DOMstrings.percentageLabel).textContent = "---";

        }

      },

      displayPercentages: function(percentages) {

        var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

        nodeListForEach(fields, function(current, index) {

          if (percentages[index] > 0) {
            current.textContent = percentages[index] + '%';
          } else {
            current.textContent = '---';
          }
        });
      },

      displayMonth: function() {
        var now, months, month, year;

        var now = new Date();

        months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        month = now.getMonth();

        year = now.getFullYear();
        document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
      },

      changedType: function() {

        var fields = document.querySelectorAll(
          DOMstrings.inputType + ',' +
          DOMstrings.inputDescription + ',' +
          DOMstrings.inputValue);

        nodeListForEach(fields, function(current) {
           current.classList.toggle('red-focus');
        });

        document.querySelector(DOMstrings.inputBtn).classList.toggle('red');

      },

      getDOMstrings: function () {
        return DOMstrings;

    }
  };
})();



// GLOBAL APP CONTOLLER
var controller = (function (budgetCtrl, UICtrl) {

    var setupEventListeners = function() {
      var DOM = UICtrl.getDOMstrings();

      document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

      //  added to global document
      document.addEventListener('keypress', function (event) {
        if (event.keyCode === 13 || event.which === 13) {
          ctrlAddItem();
         }
      });

      document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

      document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);

    };

    var updateBudget = function() {
      // calculate the budget
      budgetCtrl.calculateBudget();

      //  return the budget
      var budget = budgetCtrl.getBudget();

      // display the budget on the UI
      UICtrl.displayBudget(budget)
    };

    var updatePercentage = function() {

      //  calculate percentages
      budgetCtrl.calculatePercentages();
      //  read percentages from budget controller
      var percentages = budgetCtrl.getPercentages();
      //  update user interface with new percentages
      UICtrl.displayPercentages(percentages);


    };

    var ctrlAddItem = function () {
      var input, newItem;
      //  1. get filed input data
      input = UICtrl.getInput();


      if (input.description !== "" && !isNaN(input.value) && input.value > 0) {

      //  2. add the item to the budget controller
        newItem = budgetCtrl.addItem(input.type, input.description, input.value);

      //  3. add the item the UI
        UICtrl.addListItem(newItem, input.type);

      //  4. clear te fields
        UICtrl.clearFields();

      //  5. calculate and update budget
        updateBudget();

      // 6. calculate/update percentages
        updatePercentage();

      }

    };

    var ctrlDeleteItem = function(event) {
      var itemID, splitID, type, ID;

      itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

      if (itemID) {
        splitID = itemID.split('-');
        type = splitID[0];
        ID = parseInt(splitID[1]);

        //  delete item from data structure
        budgetCtrl.deleteItem(type, ID);
        //  delete item from user interface
        UICtrl.deleteListItem(itemID);

        //  update/show new budget
        updateBudget();

        // calculate/updated percentages
        updatePercentages()
;      }
    };

    return {
      init: function() {
        console.log('app has started');
        UICtrl.displayMonth();
        UICtrl.displayBudget({
          budget: 0,
          totalInc: 0,
          totalExp: 0,
          percentage: -1
        });
        setupEventListeners();
      }
    };

})(budgetController, UIController);


controller.init();
