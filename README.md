# GSpreadReader
Google SpeadSheet Reader

# Install 

```
npm install gspreadreader --save
```

# Example 

```js
const GSpread = require('gspreadreader');

setImmediate(async function() {
    const TODOSpread = new GSpread({
        id: '1J78UakpjTBUeFFPBmvcA7rolrlXf8PcWmrww5e1_JUs',
        tab: 1,
        titleHeader : true
    });
    await TODOSpread.getData().catch( E => console.trace(E) );

    console.log(TODOSpread.authors); // Array of author with name and email fields.
    console.log(TODOSpread.updated); // JS Date of last update.
    console.log(TODOSpread.title); // Sheet title!

    TODOSpread.rows.forEach( (task,id) => {
        if(id === "1") return;
        console.log('----------------');
        console.log(`name => ${task.name}`);
        console.log(`description => ${task.description}`);
        console.log(`max time => ${task.maxtime}`);
    }); 
});
```

The constructor take the google spreadsheet id, the tab id (default set to 1) and a optional argument 'titleHeader'.

When titleHeader is set to true, the code check the first Row and assign column id content as object key title. If set to false, the row is equal to an array.