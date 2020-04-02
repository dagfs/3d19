import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [data, setData] = useState({
    selectedMaker: null,
    makers: [],
    orders: [],
    work: [],
    inventories: [],
    selectedInventory: {},
    selectedWork: [],
    ordersMap: {}
  });

  function setSelectedMaker(selectedMaker) {
    const selectedInventory = selectedMaker
      ? data.inventories.find(
          i => i.fields.Maker && i.fields.Maker[0] === selectedMaker.id
        )
      : null;
    const selectedWork = selectedMaker
      ? data.work.filter(
          i => i.fields.Maker && i.fields.Maker[0] === selectedMaker.id
        )
      : [];
    setData({ ...data, selectedMaker, selectedInventory, selectedWork });
  }

  async function registerIntendedWork(order, maker) {
    const number = prompt("Hvor mange?");

    postTable("Arbeid", {
      fields: {
        Name: "tet",
        Bestilling: [order.id],
        Maker: [maker.id],
        Antall: number
      }
    });
    setTimeout(async () => {
      const work = (await fetchTable("Arbeid")).records;
      const selectedWork = data.selectedMaker
        ? work.filter(
            i => i.fields.Maker && i.fields.Maker[0] === data.selectedMaker.id
          )
        : [];
      setData({ ...data, work, selectedWork });
    }, 1000);
  }

  async function fetchData() {
    const orders = (await fetchTable(TABLES.Bestillinger)).records;
    const makers = (await fetchTable(TABLES.Makers)).records;
    const ordersMap = {};
    orders.map(o => (ordersMap[o.id] = o));
    const inventories = (await fetchTable("Beholdning")).records;
    const work = (await fetchTable("Arbeid")).records;
    setData({ ...data, makers, orders, inventories, work, ordersMap });
  }

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="App">
      <h1>
        Hi,{" "}
        {data.selectedMaker
          ? data.selectedMaker.fields.Name
          : "please select your name"}
      </h1>
      {data.selectedMaker ? (
        <div id="profile">
          <Orders
            orders={data.orders}
            registerIntendedWork={registerIntendedWork}
            selectedMaker={data.selectedMaker}
          />
          <Inventory inventory={data.selectedInventory} />
          <Work work={data.selectedWork} ordersMap={data.ordersMap} />
        </div>
      ) : (
        <div>
          <Makers setSelectedMaker={setSelectedMaker} makers={data.makers} />
        </div>
      )}
    </div>
  );
}

const Orders = ({ orders, selectedMaker, registerIntendedWork }) => {
  return (
    <div>
      <h2>These are the orders that needs help:</h2>
      <div>
        {orders.map(order => (
          <div key={order.id}>
            {order.fields.Instutisjon} - {order.fields.Antall}
            <button
              type="button"
              onClick={() => registerIntendedWork(order, selectedMaker)}
            >
              Ta på deg oppdraget
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const Makers = ({ makers, setSelectedMaker }) => {
  return (
    <div id="makers">
      {makers.map(maker => (
        <button
          type="button"
          key={maker.id}
          onClick={() => setSelectedMaker(maker)}
        >
          {maker.fields.Name}
        </button>
      ))}
    </div>
  );
};

const Inventory = ({ inventory }) => {
  return (
    <div>
      <h2>Your inventory</h2>
      <table>
        <tbody>
          <tr>
            <td>strikk</td>
            <td>ferdige masker</td>
            <td>plater til visir</td>
          </tr>

          <tr>
            <td>
              <input defaultValue={inventory.fields["Antall strikk"]} />
            </td>
            <td>
              <input
                defaultValue={inventory.fields["Ferdige masker til overs"]}
              />
            </td>
            <td>
              <input defaultValue={inventory.fields["Plast plate til visir"]} />
            </td>
          </tr>
        </tbody>
      </table>

      <button type="button">Oppdater</button>
    </div>
  );
};

const Work = ({ work, ordersMap }) => {
  console.log("work", work);
  return (
    <div>
      <h2>Your work</h2>
      <table>
        <tbody>
          <tr>
            <td>Bestilling</td>
            <td>Antall</td>
            <td>Status</td>
          </tr>
          {work.map(w => (
            <tr key={w.id}>
              <td>
                {w.fields.Bestilling &&
                  w.fields.Bestilling[0] &&
                  ordersMap[w.fields.Bestilling[0]].fields.Instutisjon}
              </td>
              <td>{w.fields.Antall}</td>
              <td>
                <select>
                  <option>Ikke startet</option>
                  <option>Påbegynt</option>
                  <option>Ferdig</option>
                  <option>Levert</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const TABLES = {
  Bestillinger: "Bestillinger",
  Makers: "Makers"
};

function fetchTable(table, callback) {
  return fetch(`https://api.airtable.com/v0/appJyPyQc5WakmhqU/${table}`, {
    method: "get",
    headers: new Headers({
      Authorization: "Bearer keyZl2ED1jRXncibg"
    })
  }).then(response => response.json());
}

function postTable(table, data) {
  return fetch(`https://api.airtable.com/v0/appJyPyQc5WakmhqU/${table}`, {
    method: "post",
    headers: new Headers({
      "content-type": "application/json",
      Authorization: "Bearer keyZl2ED1jRXncibg"
    }),
    body: JSON.stringify(data)
  });
}

export default App;
