<script>
 
let activeTab="catalog";

function goTo(path) { 

  window.location.href = path;
}


</script>

<div class="catalog-container">
 <h1>ADMIN CATALOG</h1>

  <div class="button-group">

 <button class="logout-button"class:active={activeTab === "logout"}
 on:click= {() => goTo("/")}>
  LOG OUT</button>

 <button class="library-button" class:active={activeTab === "library"}
 on:click= {() => goTo("library")}>
 LIBRARY</button>


 <button class="catalog-button" class:active={activeTab === "catalog"}
 on:click= {() => goTo("catalog")}> 
 CATALOG</button>
   </div>
</div>

<div class="catalog-component-box">

 <input type="text" placeholder="Component Name..." class="component-input"/>
 <input type="text" placeholder="Description..." class="description-input"/>
<button class="add-button">ADD</button>
</div>

<style>

:global(body) {
  background-color: #19333c;
  margin: 0;
  padding: 0;
  color: #fff;
  font-family: sans-serif;
}

:global(.button-group) {
  display: flex;
  gap: 10px;
  margin-left: auto; 
  padding: 0 20px;
  height: 50px;
}

:global(.library-button){
background-color: #3E92B5;
color: #fff;
border-radius: 10px;
max-width: 100px;
padding: 6px 10px;
border-color: #3E92B5;
border-width: 5px;
}

:global(.catalog-button){
background-color:  #CF8C44;
color: #fff;
border-radius: 10px;
max-width: 100px;
padding: 6px 10px;
border-color: #3E92B5;
border-width: 5px;
}

:global(.logout-button){
background-color: #b50b0b;
color: #fff;
border-radius: 10px;
max-width: 100px;
padding: 6px 10px;
border-color: #841f03;
border-width: 5px;
}

.catalog-container {
  background-color: #000000;
  height: 80px;
  width: auto;               /* let width be determined by margins */
  max-width: 2000px;         /* optional: limit maximum width */
  margin: 10px 15px 0 15px;  /* top 10px, left/right 15px, bottom 0 */
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: 0 20px;           /* space inside header for text */
  position: fixed;
  top: 0;
  left: 0;                    /* stays at top-left */
  right: 0;                   /* ensures it stops at right margin */
  z-index: 1000;
  color: #CF8C44;
  font-size: 24px;
  font-weight: bold;
  border-radius: 20px;
  border: 1px solid #3E92B5;
}


.catalog-component-box {
     display: flex;
     gap: 10px;
     padding: 20px;
     margin-top: 100px; 
      height: 50px;
}

.component-input{
flex: 1;
max-width: 150px;
padding: 6px 10px;
background-color: #000000;
 color: #CF8C44;
border: 1px solid #3E92B5;
border-radius: 10px;
font-size: 16px;
}
.description-input {
 flex: 3;
 padding: 6px 10px;
 max-width: 1700px;
 background-color: #000000;
 color: #CF8C44;
 border: 1px solid #3E92B5;
    border-radius: 10px;
font-size: 16px;
}

.add-button{
background-color: #CF8C44;
color: #fff;
border-radius: 10px;
max-width: 500px;
padding: 6px 10px;
border: none;
font-size: 16px; 
}


</style>
