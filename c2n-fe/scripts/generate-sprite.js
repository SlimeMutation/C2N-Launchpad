var fs = require('fs');
var path = require('path');
var Spritesmith = require('spritesmith');

var coordinates = [];
var counter = 0;

function writeCoordinates(){
  if(counter == 0) {
    fs.writeFileSync(path.resolve(__dirname, '../src/styles/icons.scss'),
      coordinates.map(v=>`
        .${v.name} {
          background-image: url(${v.url});
          background-position: -${v.x}px -${v.y}px;
          background-size: auto;
          width: ${v.width}px;
          height: ${v.height}px;
        }
      `).join('').replace(/\s+/g, ' ')
    );
  }
}

function coordinatesFormatter(coordinates, bgDest) {
  return Object.entries(coordinates).map(([key, value])=>{
    return Object.assign(value, {
      name: key.replace(/.*\/(.*)\.png/g, 'icon-$1').replace(/_/g,'-'),
      url: bgDest,
    })
  });
}

// Generate our spritesheet
var index_1_src = [
  path.resolve(__dirname, '../src/assets/icons/index_1_1.png'),
  path.resolve(__dirname, '../src/assets/icons/index_1_2.png'),
];
var index_1_dist = path.resolve(__dirname, '../src/assets/images/index_1_icons.png');
counter++;

Spritesmith.run({src: index_1_src}, function handleResult (err, result) {
  // result.image; // Buffer representation of image
  // result.coordinates; // Object mapping filename to {x, y, width, height} of image
  // result.properties; // Object with metadata about spritesheet {width, height}
  fs.writeFileSync(index_1_dist, result.image);
  coordinates = coordinates.concat(coordinatesFormatter(result.coordinates, '~@src/assets/images/index_1_icons.png'));
  counter--;
  writeCoordinates();
});

// Generate our spritesheet
var index_3_src = [
  path.resolve(__dirname, '../src/assets/icons/index_3_1.png'),
  path.resolve(__dirname, '../src/assets/icons/index_3_2.png'),
  path.resolve(__dirname, '../src/assets/icons/index_3_3.png'),
  path.resolve(__dirname, '../src/assets/icons/index_3_4.png'),
  path.resolve(__dirname, '../src/assets/icons/index_3_5.png'),
  path.resolve(__dirname, '../src/assets/icons/index_3_6.png'),
  path.resolve(__dirname, '../src/assets/icons/index_3_7.png'),
];
var index_3_dist = path.resolve(__dirname, '../src/assets/images/index_3_icons.png');
counter++;

Spritesmith.run({src: index_3_src}, function handleResult (err, result) {
  // result.image; // Buffer representation of image
  // result.coordinates; // Object mapping filename to {x, y, width, height} of image
  // result.properties; // Object with metadata about spritesheet {width, height}
  fs.writeFileSync(index_3_dist, result.image);
  coordinates = coordinates.concat(coordinatesFormatter(result.coordinates, '~@src/assets/images/index_3_icons.png'));
  counter--;
  writeCoordinates();
});

// Generate our spritesheet
var index_5_src = [
  path.resolve(__dirname, '../src/assets/icons/index_5_1.png'),
  path.resolve(__dirname, '../src/assets/icons/index_5_2.png'),
  path.resolve(__dirname, '../src/assets/icons/index_5_3.png'),
  path.resolve(__dirname, '../src/assets/icons/index_5_4.png'),
  path.resolve(__dirname, '../src/assets/icons/index_5_5.png'),
  path.resolve(__dirname, '../src/assets/icons/index_5_6.png'),
];
var index_5_dist = path.resolve(__dirname, '../src/assets/images/index_5_icons.png')
counter++;

Spritesmith.run({src: index_5_src}, function handleResult (err, result) {
  // result.image; // Buffer representation of image
  // result.coordinates; // Object mapping filename to {x, y, width, height} of image
  // result.properties; // Object with metadata about spritesheet {width, height}
  fs.writeFileSync(index_5_dist, result.image);
  coordinates = coordinates.concat(coordinatesFormatter(result.coordinates, '~@src/assets/images/index_5_icons.png'));
  counter--;
  writeCoordinates();
});

// Generate our spritesheet
var index_7_src = [
  path.resolve(__dirname, '../src/assets/icons/index_7_1.png'),
  path.resolve(__dirname, '../src/assets/icons/index_7_2.png'),
  path.resolve(__dirname, '../src/assets/icons/index_7_3.png'),
  path.resolve(__dirname, '../src/assets/icons/index_7_4.png'),
  path.resolve(__dirname, '../src/assets/icons/index_7_5.png'),
];
var index_7_dist = path.resolve(__dirname, '../src/assets/images/index_7_icons.png')
counter++;

Spritesmith.run({src: index_7_src}, function handleResult (err, result) {
  // result.image; // Buffer representation of image
  // result.coordinates; // Object mapping filename to {x, y, width, height} of image
  // result.properties; // Object with metadata about spritesheet {width, height}
  fs.writeFileSync(index_7_dist, result.image);
  coordinates = coordinates.concat(coordinatesFormatter(result.coordinates, '~@src/assets/images/index_7_icons.png'));
  counter--;
  writeCoordinates();
});

// Generate our spritesheet
var pool_src = [
  path.resolve(__dirname, '../src/assets/icons/pool_1.png'),
  path.resolve(__dirname, '../src/assets/icons/pool_2.png'),
  path.resolve(__dirname, '../src/assets/icons/pool_3.png'),
  path.resolve(__dirname, '../src/assets/icons/pool_4.png'),
  path.resolve(__dirname, '../src/assets/icons/pool_5.png'),
];
var pool_dist = path.resolve(__dirname, '../src/assets/images/pool_icons.png')
counter++;

Spritesmith.run({src: pool_src}, function handleResult (err, result) {
  // result.image; // Buffer representation of image
  // result.coordinates; // Object mapping filename to {x, y, width, height} of image
  // result.properties; // Object with metadata about spritesheet {width, height}
  fs.writeFileSync(pool_dist, result.image);
  coordinates = coordinates.concat(coordinatesFormatter(result.coordinates, '~@src/assets/images/pool_icons.png'));
  counter--;
  writeCoordinates();
});

// Generate our spritesheet
var stake_src = [
  path.resolve(__dirname, '../src/assets/icons/stake_1.png'),
  path.resolve(__dirname, '../src/assets/icons/stake_2.png'),
  path.resolve(__dirname, '../src/assets/icons/stake_3.png'),
  path.resolve(__dirname, '../src/assets/icons/stake_4.png'),
  path.resolve(__dirname, '../src/assets/icons/stake_5.png'),
  path.resolve(__dirname, '../src/assets/icons/stake_6.png'),
];
var stake_dist = path.resolve(__dirname, '../src/assets/images/stake_icons.png')
counter++;

Spritesmith.run({src: stake_src}, function handleResult (err, result) {
  // result.image; // Buffer representation of image
  // result.coordinates; // Object mapping filename to {x, y, width, height} of image
  // result.properties; // Object with metadata about spritesheet {width, height}
  fs.writeFileSync(stake_dist, result.image);
  coordinates = coordinates.concat(coordinatesFormatter(result.coordinates, '~@src/assets/images/stake_icons.png'));
  counter--;
  writeCoordinates();
});

// Generate our spritesheet
var media_src = [
  path.resolve(__dirname, '../src/assets/icons/media_1.png'),
  path.resolve(__dirname, '../src/assets/icons/media_2.png'),
  path.resolve(__dirname, '../src/assets/icons/media_3.png'),
  path.resolve(__dirname, '../src/assets/icons/media_4.png'),
];
var media_dist = path.resolve(__dirname, '../src/assets/images/media_icons.png')
counter++;

Spritesmith.run({
  src: media_src,
  algorithm: 'alt-diagonal'}
  , function handleResult (err, result) {
  // result.image; // Buffer representation of image
  // result.coordinates; // Object mapping filename to {x, y, width, height} of image
  // result.properties; // Object with metadata about spritesheet {width, height}
  fs.writeFileSync(media_dist, result.image);
  coordinates = coordinates.concat(coordinatesFormatter(result.coordinates, '~@src/assets/images/media_icons.png'));
  counter--;
  writeCoordinates();
});

// Generate our spritesheet
var project_card_src = [
  path.resolve(__dirname, '../src/assets/icons/project_card_1.png'),
  path.resolve(__dirname, '../src/assets/icons/project_card_2.png'),
  path.resolve(__dirname, '../src/assets/icons/project_card_3.png'),
];
var project_card_dist = path.resolve(__dirname, '../src/assets/images/project_card_icons.png')
counter++;

Spritesmith.run({
  src: project_card_src,
  algorithm: 'alt-diagonal'}
  , function handleResult (err, result) {
  // result.image; // Buffer representation of image
  // result.coordinates; // Object mapping filename to {x, y, width, height} of image
  // result.properties; // Object with metadata about spritesheet {width, height}
  fs.writeFileSync(project_card_dist, result.image);
  coordinates = coordinates.concat(coordinatesFormatter(result.coordinates, '~@src/assets/images/project_card_icons.png'));
  counter--;
  writeCoordinates();
});