/* 
    요약 : simple mp4 streaming server
    문제점 : 크롬에서는 동영상 seek(원하는 부분으로 이동)이 안됨.
    원인 : 크롬은 미디어 파일용으로 Content-Range 헤더로 여러개의 HTTP 요청을 하며
    206 status 를 예상한다. 
    만약 200 OK status 를 Accept-Ranges:none 헤더와 함께 응답을 보내면 미디어 파일이 실행은 되지만
    seek는 되지 않는다.
*/
const http = require('http');
const url = require('url');
const fs = require('fs');

const server = http.createServer(function(req, res) {

    let parsedUrl = url.parse(req.url);
    let resource = parsedUrl.pathname;
    console.log('resource='+resource);

    let resourcePath = '.'+resource;
    console.log('resource path = '+resourcePath);

    // html 페이지 요청시 텍스트 파일 처리
    if(resource.indexOf('/html/') == 0){
        console.log('html request!');
        fs.readFile(resourcePath, 'utf-8', function(err, data){
            if(err) {
                res.writeHead(500, {'Content-Type':'text/html'});
                res.end('500 Internal Server'+err);
            } else {
                res.writeHead(200, {'Content-Type':'text/html'});
                res.end(data);
            }
        })
    } else if(resource.indexOf('/video/') == 0) {
        console.log('video request!')
        let stream = fs.createReadStream(resourcePath);
        let count = 0;
        stream.on('data', function(data){
            count++;
            console.log('data count : '+count);
            res.write(data);
        })
        
        stream.on('end', function(data){
            console.log('end streaming');
            res.end();
        })
    }
});

server.listen(80, function(){
    console.log('server is running');
})