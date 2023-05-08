function Restest() {
    let bearer_token = null;
    let tests_count = 0;
    let tests_ok_count = 0;
    let tests_error_count = 0;

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
    
    this.errors = function() {return tests_error_count;};
    this.token = function() {return bearer_token;};

    this.testAll = function () {
        let tl = document.querySelectorAll("[data-rest-test-url], [href][data-rest-test]");
        for (let i = 0; i < tl.length; ++i) {
            let element = tl.item(i);
            let url = element.hasAttribute("href") ? element.getAttribute("href") : element.getAttribute("data-rest-test-url");
            let method = element.hasAttribute("data-rest-test-method") ? element.getAttribute("data-rest-test-method") : "GET";
            let payload = element.hasAttribute("data-rest-test-payload") ? element.getAttribute("data-rest-test-method") : null;
            let payloadType = element.hasAttribute("data-rest-test-content-type") ? element.getAttribute("data-rest-test-content-type") : null;
            let acceptType = element.hasAttribute("data-rest-test-accept") ? element.getAttribute("data-rest-test-accept") : null;
            let authorization = element.hasAttribute("data-rest-test-auth") ? bearer_token : null;
            let responseText = element.hasAttribute("data-rest-test-response") ? element.getAttribute("data-rest-test-response") : null;
            let responseStatus = element.hasAttribute("data-rest-test-status") ? element.getAttribute("data-rest-test-status") : 200;
            let responseTarget = element.hasAttribute("data-rest-test-target") ? document.querySelector(element.getAttribute("data-rest-test-target")) : null;
            let responseHasToken = element.hasAttribute("data-rest-test-token");
            let responseCallback = function (callResponse, callStatus) {
                console.log(method + " " + url + " response: " + callStatus + ": " + callResponse);
                if (responseTarget!==null) {
                    responseTarget.textContent = callStatus + ": " + callResponse;
                }
                element.classList.remove("rest-test-wait");
                if ((responseStatus === null || (callStatus == responseStatus))
                        && (responseText === null || (callResponse === responseText))) {
                    element.classList.add("rest-test-ok");
                    tests_ok_count++;
                    if (responseHasToken) {
                        console.log("got bearer token: " + callResponse);
                        bearer_token = callResponse;
                    }
                } else {
                    tests_error_count++;
                    element.classList.add("rest-test-error");
                    element.setAttribute("data-test-out-response", callResponse);
                    element.setAttribute("data-test-out-status", callStatus);
                    element.setAttribute("title", callStatus + " " + callResponse);
                }
                if (tests_error_count > 0) {
                    document.body.classList.add("rest-test-error-all");
                    document.body.classList.remove("rest-test-ok-all");
                } else {
                    document.body.classList.remove("rest-test-error-all");
                    document.body.classList.add("rest-test-ok-all");
                }

            };
            console.log("checking rest endpoint: " + url + (authorization !== null ? " with token " + bearer_token : "") + (responseHasToken ? " (getting bearer token)" : ""));
            element.classList.add("rest-test-wait");
            tests_count++;
            sendRestRequest(method, url, responseCallback, acceptType, payload, payloadType, authorization);
        }
    };
}