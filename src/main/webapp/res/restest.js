function Restest() {
    let bearer_token = null;
    let tests_count = 0;
    let tests_ok_count = 0;
    let tests_error_count = 0;
    let token_waiting_list = [];
    let THIS = this;

    let sendRestRequest = function (method, url, callback, acceptType = null, payload = null, payloadType = null, token = null) {
        let xhr = new XMLHttpRequest();
        xhr.open(method, url, true);
        if (token !== null)
            xhr.setRequestHeader("Authorization", "Bearer " + token);
        if (payloadType !== null)
            xhr.setRequestHeader("Content-Type", payloadType);
        if (acceptType !== null)
            xhr.setRequestHeader("Accept", acceptType);
        xhr.send(payload);
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                let response = xhr.responseText;
                let status = xhr.status;
                callback(response, status);
            }
        };
    };

    this.errors = function () {
        return tests_error_count;
    };
    
    this.token = function () {
        return bearer_token;
    };

    this.testItem = function (itemToTest, responseCallback = null) {
        if (responseCallback === null)
            //default response callback
            responseCallback = function (callResponse, callStatus) {
                console.log(itemToTest.method + " " + itemToTest.url + " response: " + callStatus + ": " + callResponse);
                if (itemToTest.responseTarget !== null) {
                    itemToTest.responseTarget.textContent = callStatus + ": " + callResponse;
                }
                itemToTest.source.classList.remove("rest-test-wait");
                if ((itemToTest.responseStatus === null || (callStatus == itemToTest.responseStatus))
                        && (itemToTest.responseText === null || (callResponse === itemToTest.responseText))) {
                    itemToTest.source.classList.add("rest-test-ok");
                    tests_ok_count++;
                    if (itemToTest.responseHasToken) {
                        console.log("got bearer token: " + callResponse);
                        bearer_token = callResponse;
                        testAuthItems();
                    }
                } else {
                    tests_error_count++;
                    itemToTest.source.classList.add("rest-test-error");
                    itemToTest.source.setAttribute("data-test-out-response", callResponse);
                    itemToTest.source.setAttribute("data-test-out-status", callStatus);
                    itemToTest.source.setAttribute("title", callStatus + " " + callResponse);
                }
                if (tests_error_count > 0) {
                    document.body.classList.add("rest-test-error-all");
                    document.body.classList.remove("rest-test-ok-all");
                } else {
                    document.body.classList.remove("rest-test-error-all");
                    document.body.classList.add("rest-test-ok-all");
                }
            };

        itemToTest.source.classList.add("rest-test-wait");
        console.log("checking REST endpoint: " + itemToTest.method + " " + itemToTest.url + (itemToTest.needsAuthorization ? " with token " + bearer_token : "") + (itemToTest.responseHasToken ? " (getting bearer token)" : ""));
        tests_count++;
        sendRestRequest(itemToTest.method, itemToTest.url, responseCallback, itemToTest.acceptType, itemToTest.payload, itemToTest.payloadType, bearer_token);
    };

    let testAuthItems = function () {
        for (let i = 0; i < token_waiting_list.length; ++i) {
            THIS.testItem(token_waiting_list[i]);
        }
    };

    this.testAll = function () {
        token_waiting_list = [];
        let tl = document.querySelectorAll("[data-rest-test-url], [href][data-rest-test]");
        for (let i = 0; i < tl.length; ++i) {
            let element = tl.item(i);
            let itemToTest = {
                source: tl.item(i),
                url: element.hasAttribute("href") ? element.getAttribute("href") : element.getAttribute("data-rest-test-url"),
                method: element.hasAttribute("data-rest-test-method") ? element.getAttribute("data-rest-test-method") : "GET",
                payload: element.hasAttribute("data-rest-test-payload") ? element.getAttribute("data-rest-test-method") : null,
                payloadType: element.hasAttribute("data-rest-test-content-type") ? element.getAttribute("data-rest-test-content-type") : null,
                acceptType: element.hasAttribute("data-rest-test-accept") ? element.getAttribute("data-rest-test-accept") : null,
                needsAuthorization: element.hasAttribute("data-rest-test-auth"),
                responseText: element.hasAttribute("data-rest-test-response") ? element.getAttribute("data-rest-test-response") : null,
                responseStatus: element.hasAttribute("data-rest-test-status") ? element.getAttribute("data-rest-test-status") : 200,
                responseTarget: element.hasAttribute("data-rest-test-target") ? document.querySelector(element.getAttribute("data-rest-test-target")) : null,
                responseHasToken: element.hasAttribute("data-rest-test-token")
            };
            element.classList.add("rest-test-wait");
            if (!itemToTest.needsAuthorization || bearer_token !== null) {
                THIS.testItem(itemToTest);
            } else {
                token_waiting_list.push(itemToTest);
            }
        }
    };
}