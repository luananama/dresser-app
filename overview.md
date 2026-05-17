# Closet gamification app

Full-stack closet gamification app. The goal is to make sustainable fashion habits
 fun by rewarding re-wearing, longevity, upcycling, and resisting buying new —
 using RPG-style XP, levels, and achievements inspired by Habitica's pixel-art
 aesthetic. The app is mobile-first, but also work in browser (browser + phone-optimized).

## Design
The design should be fun an playful, inspired by games or gamified platforms like habitica. It should have at least a bit of pink, and pixel-art elements. Pick a clean, airy design.
## Features
There are several features that build on top of each other: 

### Phase 1: Inventory
**Objective:** Build the platform's core functionality with a basic, operational MVP that allows a user to log in, view, edit or delete the items in their closet inventory
Essential Features:
- User authentication (sign-up, log-in, password reset)
- Upload clothing items (create, delete, add and modify information or picture)
- Clothing items information 
  - category: tops, bottoms, full body,  outerwear, footwear, accessories
  - subcategory: pants, skirt, dress, tshirt, long sleeve, coat, raincoat, etc.
  - date aquired
  - type/source/state: thrifted, passed down, gift, bought, handmade, upcycled, etc.
  - fabric
  - age
  - season (all year, summer spring winter fall)
  - picture

### Phase 2: Outfits
**Objective:** Add outfit creation and track the items worn, view basic stats regarding the items' usage, change or delete outfits, and log outfits on a specific day.
An outfit will be built as follows:
	-  the core pieces that go on the body (for example one top and one bottom)
	- the footwear (several footwear items can be added, and when tracking an outfit as worn, the user can select the item worn on that day. same core pieces with different shoes count as one item)
 	- layers (several layer options can be added, similar to the footwear)
	- accessories (similar)
The goal with having multiple options for footwear, layers ad accessories is to have a core outfit that can be tracked, pick pieces that could be worn with it (for instance, a specific coat, versus one that doesn’t work as well), and track the wear on those pieces as well, even if they are not part of the core outfit. 

### Phase 3: Gamification
**Objective:** Add a dashboard where the user can see statistics and earn XP based on specifc goals



