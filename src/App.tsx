import React, { useState } from 'react';
import { PlusCircle, Receipt, Users, Wallet, DollarSign, ArrowRight, ArrowRightLeft, Pencil, Trash2, X } from 'lucide-react';

function App() {
  const [people, setPeople] = useState<string[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [payer, setPayer] = useState("");
  const [item, setItem] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('add-people');
  const [editingExpense, setEditingExpense] = useState<number | null>(null);

  const addPerson = () => {
    const name = (document.getElementById("nameInput") as HTMLInputElement)?.value.trim();
    if (name && !people.includes(name)) {
      setPeople([...people, name]);
    }
    (document.getElementById("nameInput") as HTMLInputElement).value = "";
  };

  const addExpense = () => {
    if (payer && item && amount && selectedUsers.length > 0) {
      if (editingExpense !== null) {
        // Update existing expense
        const updatedExpenses = [...expenses];
        updatedExpenses[editingExpense] = {
          payer,
          item,
          amount: parseFloat(amount),
          sharedAmong: [...selectedUsers],
        };
        setExpenses(updatedExpenses);
        setEditingExpense(null);
      } else {
        // Add new expense
        setExpenses([
          ...expenses,
          { payer, item, amount: parseFloat(amount), sharedAmong: [...selectedUsers] },
        ]);
      }
      setPayer("");
      setItem("");
      setAmount("");
      setSelectedUsers([]);
    }
  };

  const startEditExpense = (index: number) => {
    const expense = expenses[index];
    setPayer(expense.payer);
    setItem(expense.item);
    setAmount(expense.amount.toString());
    setSelectedUsers(expense.sharedAmong);
    setEditingExpense(index);
    setActiveTab('add-expense');
  };

  const cancelEdit = () => {
    setPayer("");
    setItem("");
    setAmount("");
    setSelectedUsers([]);
    setEditingExpense(null);
  };

  const deleteExpense = (index: number) => {
    const updatedExpenses = expenses.filter((_, i) => i !== index);
    setExpenses(updatedExpenses);
  };

  const handleUserSelection = (user: string) => {
    setSelectedUsers((prev) =>
      prev.includes(user) ? prev.filter((u) => u !== user) : [...prev, user]
    );
  };

  const calculateExpenses = () => {
    let individualExpenses: Record<string, any> = {};
    people.forEach((person) => {
      individualExpenses[person] = {
        paid: 0,
        commonShare: 0,
        exclusiveShare: 0,
        totalShare: 0,
        netAmount: 0,
      };
    });

    expenses.forEach(({ payer, amount, sharedAmong }) => {
      individualExpenses[payer].paid += amount;

      if (sharedAmong.length === 1) {
        individualExpenses[sharedAmong[0]].exclusiveShare += amount;
      } else {
        let sharePerPerson = amount / sharedAmong.length;
        sharedAmong.forEach((user: string) => {
          individualExpenses[user].commonShare += sharePerPerson;
        });
      }
    });

    people.forEach((person) => {
      individualExpenses[person].totalShare =
        individualExpenses[person].commonShare +
        individualExpenses[person].exclusiveShare;
      individualExpenses[person].netAmount =
        individualExpenses[person].paid - individualExpenses[person].totalShare;
    });

    return individualExpenses;
  };

  const calculateSettlements = () => {
    const individualExpenses = calculateExpenses();
    let settlements: { from: string; to: string; amount: number }[] = [];
    
    let debtors = people.filter(person => individualExpenses[person].netAmount < 0)
      .map(person => ({
        name: person,
        amount: Math.abs(individualExpenses[person].netAmount)
      }));
    
    let creditors = people.filter(person => individualExpenses[person].netAmount > 0)
      .map(person => ({
        name: person,
        amount: individualExpenses[person].netAmount
      }));
    
    debtors.sort((a, b) => b.amount - a.amount);
    creditors.sort((a, b) => b.amount - a.amount);
    
    while (debtors.length > 0 && creditors.length > 0) {
      const debtor = debtors[0];
      const creditor = creditors[0];
      
      const settlementAmount = Math.min(debtor.amount, creditor.amount);
      
      if (settlementAmount >= 0.01) {
        settlements.push({
          from: debtor.name,
          to: creditor.name,
          amount: settlementAmount
        });
      }
      
      debtor.amount -= settlementAmount;
      creditor.amount -= settlementAmount;
      
      if (debtor.amount < 0.01) debtors.shift();
      if (creditor.amount < 0.01) creditors.shift();
    }
    
    return settlements;
  };

  const individualExpenses = calculateExpenses();
  const settlements = calculateSettlements();

  const getMaxAmount = () => {
    return Math.max(...people.map(person => Math.abs(individualExpenses[person].netAmount)));
  };

  const maxAmount = getMaxAmount();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-blue-900">
          Trip Expense Tracker
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div 
            className={`bg-white rounded-xl shadow-lg p-6 transform transition-all duration-300 hover:scale-105 ${activeTab === 'add-people' ? 'ring-2 ring-blue-500' : ''}`}
            onClick={() => setActiveTab('add-people')}
          >
            <div className="flex items-center mb-4">
              <Users className="w-6 h-6 text-blue-500 mr-2" />
              <h2 className="text-xl font-semibold text-gray-800">Add People</h2>
            </div>
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  id="nameInput"
                  type="text"
                  placeholder="Enter Name"
                  className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={addPerson}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <PlusCircle className="w-5 h-5" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {people.map((person, index) => (
                  <span
                    key={index}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm animate-fade-in"
                  >
                    {person}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div 
            className={`bg-white rounded-xl shadow-lg p-6 transform transition-all duration-300 hover:scale-105 ${activeTab === 'add-expense' ? 'ring-2 ring-blue-500' : ''}`}
            onClick={() => setActiveTab('add-expense')}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Receipt className="w-6 h-6 text-green-500 mr-2" />
                <h2 className="text-xl font-semibold text-gray-800">
                  {editingExpense !== null ? 'Edit Expense' : 'Add Expense'}
                </h2>
              </div>
              {editingExpense !== null && (
                <button
                  onClick={cancelEdit}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            <div className="space-y-4">
              <select
                onChange={(e) => setPayer(e.target.value)}
                value={payer}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select Payer</option>
                {people.map((person, index) => (
                  <option key={index} value={person}>{person}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Enter Item"
                value={item}
                onChange={(e) => setItem(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <input
                type="number"
                placeholder="Enter Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-700">Select Users:</h3>
                <div className="flex flex-wrap gap-2">
                  {people.map((person, index) => (
                    <label
                      key={index}
                      className={`cursor-pointer flex items-center space-x-2 px-3 py-1 rounded-full transition-colors ${
                        selectedUsers.includes(person)
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={selectedUsers.includes(person)}
                        onChange={() => handleUserSelection(person)}
                      />
                      <span>{person}</span>
                    </label>
                  ))}
                </div>
              </div>
              <button
                onClick={addExpense}
                className="w-full bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
              >
                {editingExpense !== null ? 'Update Expense' : 'Add Expense'}
              </button>
            </div>
          </div>

          <div 
            className={`bg-white rounded-xl shadow-lg p-6 transform transition-all duration-300 hover:scale-105 ${activeTab === 'summary' ? 'ring-2 ring-blue-500' : ''}`}
            onClick={() => setActiveTab('summary')}
          >
            <div className="flex items-center mb-4">
              <Wallet className="w-6 h-6 text-purple-500 mr-2" />
              <h2 className="text-xl font-semibold text-gray-800">Summary</h2>
            </div>
            <div className="space-y-4">
              {people.map((person, index) => (
                <div key={index} className="relative">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">{person}</span>
                    <span className={`text-sm font-semibold ${
                      individualExpenses[person].netAmount >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      ₹{individualExpenses[person].netAmount.toFixed(2)}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        individualExpenses[person].netAmount >= 0 ? 'bg-green-500' : 'bg-red-500'
                      }`}
                      style={{
                        width: `${(Math.abs(individualExpenses[person].netAmount) / maxAmount) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center mb-4">
            <DollarSign className="w-6 h-6 text-yellow-500 mr-2" />
            <h2 className="text-xl font-semibold text-gray-800">Recent Expenses</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="py-2 px-4 text-left">Payer</th>
                  <th className="py-2 px-4 text-left">Item</th>
                  <th className="py-2 px-4 text-left">Amount</th>
                  <th className="py-2 px-4 text-left">Shared Among</th>
                  <th className="py-2 px-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense, index) => (
                  <tr
                    key={index}
                    className="border-b last:border-0 hover:bg-gray-50 transition-colors animate-fade-in"
                  >
                    <td className="py-2 px-4">{expense.payer}</td>
                    <td className="py-2 px-4">{expense.item}</td>
                    <td className="py-2 px-4">₹{expense.amount.toFixed(2)}</td>
                    <td className="py-2 px-4">
                      <div className="flex flex-wrap gap-1">
                        {expense.sharedAmong.map((user: string, i: number) => (
                          <span key={i} className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-sm">
                            {user}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-2 px-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEditExpense(index)}
                          className="text-blue-500 hover:text-blue-700 transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteExpense(index)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center mb-4">
            <ArrowRight className="w-6 h-6 text-indigo-500 mr-2" />
            <h2 className="text-xl font-semibold text-gray-800">Detailed Breakdown</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="py-2 px-4 text-left">Name</th>
                  <th className="py-2 px-4 text-left">Money Given</th>
                  <th className="py-2 px-4 text-left">Common Share</th>
                  <th className="py-2 px-4 text-left">Exclusive Share</th>
                  <th className="py-2 px-4 text-left">Total Share</th>
                  <th className="py-2 px-4 text-left">Net Amount</th>
                </tr>
              </thead>
              <tbody>
                {people.map((person, index) => (
                  <tr
                    key={index}
                    className="border-b last:border-0 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-2 px-4 font-medium">{person}</td>
                    <td className="py-2 px-4">₹{individualExpenses[person].paid.toFixed(2)}</td>
                    <td className="py-2 px-4">₹{individualExpenses[person].commonShare.toFixed(2)}</td>
                    <td className="py-2 px-4">₹{individualExpenses[person].exclusiveShare.toFixed(2)}</td>
                    <td className="py-2 px-4">₹{individualExpenses[person].totalShare.toFixed(2)}</td>
                    <td className={`py-2 px-4 font-semibold ${
                      individualExpenses[person].netAmount >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      ₹{individualExpenses[person].netAmount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center mb-4">
            <ArrowRightLeft className="w-6 h-6 text-orange-500 mr-2" />
            <h2 className="text-xl font-semibold text-gray-800">Settlement Plan</h2>
          </div>
          <div className="space-y-4">
            {settlements.length > 0 ? (
              settlements.map((settlement, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-orange-50 rounded-lg transform transition-all duration-300 hover:scale-102"
                >
                  <div className="flex items-center space-x-3">
                    <span className="font-medium text-orange-700">{settlement.from}</span>
                    <ArrowRight className="w-5 h-5 text-orange-500" />
                    <span className="font-medium text-orange-700">{settlement.to}</span>
                  </div>
                  <span className="font-bold text-orange-600">₹{settlement.amount.toFixed(2)}</span>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500">No settlements needed!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;