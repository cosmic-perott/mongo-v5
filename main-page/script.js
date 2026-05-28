
    const tripData = [
      {
        "date": "01/06/2026",
        "attractions": [
          {
            "name": "Corcovado & Christ the Redeemer",
            "time": "9:00 AM",
            "description": "Take the scenic cog train up Corcovado Mountain to visit the iconic art deco statue overlooking Rio."
          },
          {
            "name": "Copacabana Beach Walk",
            "time": "3:00 PM",
            "description": "Stroll along the world-famous geometric wave-patterned mosaic promenade boardwalk."
          }
        ],
        "restaurants": [
          {
            "name": "Churrascaria Palace",
            "time": "1:00 PM",
            "description": "Traditional rodizio-style Brazilian steakhouse serving premium cuts of grilled meats since 1951."
          },
          {
            "name": "Marius Degustare",
            "time": "8:30 PM",
            "description": "Unique, avant-garde nautical themed restaurant offering high-end seafood and local side dishes."
          }
        ]
      },
      {
        "date": "02/06/2026",
        "attractions": [
          {
            "name": "Sugarloaf Mountain Cable Car",
            "time": "10:00 AM",
            "description": "Ride glass-walled cable cars to the granite peak for unparalleled panoramic views of Guanabara Bay."
          },
          {
            "name": "Botanical Garden Tour",
            "time": "4:00 PM",
            "description": "Explore over 6,000 species of tropical plants and a dramatic avenue of imperial palms."
          }
        ],
        "restaurants": [
          {
            "name": "Confeitaria Colombo",
            "time": "12:30 PM",
            "description": "Historic, Belle Époque style café with stained glass skylights, famous for Portuguese custard tarts."
          },
          {
            "name": "Aprazível Restaurant",
            "time": "7:30 PM",
            "description": "Artisan Brazilian dining set in a treehouse-like tropical garden setting on Santa Teresa hill."
          }
        ]
      },
      {
        "date": "03/06/2026",
        "attractions": [
          {
            "name": "Selarón Steps (Escadaria Selarón)",
            "time": "11:00 AM",
            "description": "Climb the world-famous vibrant steps covered in over 2,000 vivid tiles from over 60 countries."
          }
        ],
        "restaurants": [
          {
            "name": "Bar do Mineiro",
            "time": "2:00 PM",
            "description": "Famous for its rich Feijoada (black bean stew) and lively bohemian neighborhood vibe."
          }
        ]
      }
    ];

    function displayCalendar() {
      const grid = document.getElementById('calendarGrid');
      grid.innerHTML = ''; 

      tripData.forEach((day, index) => {
        const dayCard = document.createElement('div');
        dayCard.className = 'calendar-day-card';

        dayCard.innerHTML = `
          <div class="day-header">
            <span class="day-label">DAY ${index + 1}</span>
            <span class="date-sub">${day.date}</span>
          </div>
        `;

        const dayBody = document.createElement('div');
        dayBody.className = 'day-body';

        let combinedItems = [];
        if (day.attractions) {
          day.attractions.forEach(item => combinedItems.push({ ...item, type: 'attraction' }));
        }
        if (day.restaurants) {
          day.restaurants.forEach(item => combinedItems.push({ ...item, type: 'restaurant' }));
        }

        if (combinedItems.length === 0) {
          dayBody.innerHTML = `<p style="font-size:0.85rem; color:#98aab6; text-align:center;">No plans scheduled for this day.</p>`;
        } else {
          combinedItems.forEach(item => {
            const isAtt = item.type === 'attraction';
            const nodeColor = isAtt ? '#52b788' : '#1565c0'; 
            const badgeText = isAtt ? 'Attraction' : 'Restaurant';
            const badgeClass = isAtt ? 'badge-attraction' : 'badge-restaurant';
            const description = isAtt ? item.description : item.food_description;

            const itemElement = document.createElement('div');
            itemElement.className = 'timeline-item';
            itemElement.innerHTML = `
              <div class="timeline-node" style="background-color: ${nodeColor}"></div>
              <div class="item-meta">
                <span class="badge ${badgeClass}">${badgeText}</span>
                <span class="time-stamp">${item.time}</span>
              </div>
              <div class="item-name">${item.name}</div>
              <div class="item-desc">${description}</div>
            `;
            dayBody.appendChild(itemElement);
          });
        }

        dayCard.appendChild(dayBody);
        grid.appendChild(dayCard);
      });
    }

    displayCalendar();
