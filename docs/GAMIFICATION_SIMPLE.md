# Simple Gamification System

## Purpose

The platform should include a simple level, title, and badge foundation from the beginning.

Do not build a complex reputation system in the first phase.

## Core Concepts

Users have:
- level
- xp
- current title
- generation badge
- badges

Generation, level, title, and badges are different concepts.

## Generation

Generation is permanent.

Examples:
- First Generation Writer
- Second Generation Writer
- Beta Member
- Founding Member

Generation does not change when the user gains XP.

## Level

Level is numeric.

Examples:
- Level 1
- Level 2
- Level 3

The UI should show level simply.

## Titles

Titles are linked to level.

Initial title ladder:
- Level 1: Supporter
- Level 2: New Writer
- Level 3: Contributor
- Level 4: Writer
- Level 5: Active Writer
- Level 6: Senior Writer
- Level 7: Lead Writer
- Level 8: Community Leader
- Level 9: Club Voice
- Level 10: Club Legend

Contributor is not the lowest title.
Supporter is the default starting title.

## XP

XP exists from the beginning, but the MVP should use a simple XP model later.

Initial future XP events:
- Create first entry/comment: +5 XP
- Create topic: +10 XP
- Receive like: +2 XP
- Create quiz: +15 XP
- Complete quiz: +3 XP
- Daily active participation: +2 XP

For the first auth/onboarding phase:
- create XP fields
- create XP event table
- do not implement automatic XP calculation yet

## Level Thresholds

Initial thresholds:
- Level 1: 0 XP
- Level 2: 50 XP
- Level 3: 150 XP
- Level 4: 300 XP
- Level 5: 600 XP
- Level 6: 1000 XP
- Level 7: 1600 XP
- Level 8: 2500 XP
- Level 9: 4000 XP
- Level 10: 7000 XP

Thresholds must be configurable.

Do not hardcode them inside UI components.

## Badges

Badges are separate from levels.

Initial badge examples:
- First Generation Writer
- First Entry
- First Topic
- First Quiz
- 100 Entries
- Most Liked Entry
- Club Loyalist
- Early Member

For MVP:
- implement only the data structure
- do not implement complex automatic badge rules yet

## Profile Display

A user profile should display:
- Username
- Primary club
- Generation badge
- Level
- Current title
- Selected badge
- Basic statistics placeholder

Example:

Username: MarcoBaggio  
Club: Juventus  
Generation: First Generation Writer  
Level: 4  
Title: Writer  
Selected Badge: First Entry
