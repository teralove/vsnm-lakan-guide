**New Version 1.1 - Fixed some bugs**

# VSNM Lakan Guide
Calls out mechanics during the fight.

![Screenshot](https://github.com/teralove/vsnm-lakan-guide/blob/master/vsnm-lakan-guide-preview.png)

Available messages:

* **Debuff (closest)**
* **Spread**
* **Gather + cleanse**
* **Debuff (furthest)**
* **Gather**
* **Gather + no cleanse**
* **Get out**  - for Begone! (Purple)
* **Get in**  - for Begone! (Red/Orange)
* **Ring soon, get ready to dodge**  - a warning at 35% for the 30% phase
* **Dodge + plague/regress**  - for the ring and shield at 30%


### Chat commands:
* **!VSNM-Lakan** or **!VSNMLakan** - Toggles the module off/on
* **!VSNM-Lakan.party** or **!VSNMLakan.party** - Toggles sending messages to party/yourself (yourself is default)

Commands are not case-sensitive. [slash](https://github.com/baldera-mods/slash) is supported but not required


### Known issues
* There's a missing "Next" message right after 30%


### Info:
* Messages starting with "Next: " are there to give you a heads up for what's coming.
* Messages without "Next: " means he's doing that mechanic right now.
* "Next" messages are sent 8s after he does an attack and after he says a message ('Lakan has noticed you', etc).


## Changelog 
## 1.1
* [+] Fixed bug: Right after 50% it would send the same "Next" message twice.
* [+] Fixed bug: After 50% the 2nd and following "Next" messages would be wrong.
* [+] Added a "Next" message right after 30% mechanic in regard to pattern inversal.
* [+] Added command varations without the hyphen (dash).
* [-] Removed player name variable cause it was not doing anything.
### 1.0.1
* [+] Fixed minor bug where toggling messages to party/self would say the wrong one.

