/********************************************************************************
 * Copyright (c) 2018 Contributors to the Eclipse Foundation
 * 
 * See the NOTICE file(s) distributed with this work for additional
 * information regarding copyright ownership.
 * 
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0, or the W3C Software Notice and
 * Document License (2015-05-13) which is available at
 * https://www.w3.org/Consortium/Legal/2015/copyright-software-and-document.
 * 
 * SPDX-License-Identifier: EPL-2.0 OR W3C-20150513
 ********************************************************************************/

try {
  var counter  = 0;
  var thing = WoT.produce({ 
      name: "MQTT-Test",
      description: "Tests a MQTT client that published counter values as an WoT event and subscribes the resetCounter topic as WoT action to reset the own counter."
  });

  console.info("Setup MQTT broker address/port details in wot-servient.conf.json (also see sample in wot-servient.conf.json_mqtt)!");

  thing
    .addAction(
      "resetCounter",
      {},
      () => {
        console.log("Resetting counter");
        counter = 0;
        return;
      })
    .addEvent(
      "counterEvent",
      {
        type: "integer" 
      });
  
  thing.expose().then(() => {
    console.info(thing.name + " ready");
    setInterval(() => {
        ++counter;
        thing.events.counterEvent.emit(counter);
        console.info("New count", counter);
    }, 1000);
  }).catch((err) => { console.error("Expose error:", err) });
  
} catch (err) {
   console.error("Script error: " + err);
}
