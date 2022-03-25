// 引入three.js
import * as THREE from "../../../three.js-r123/build/three.module.js"
import {
  CSS2DRenderer,
  CSS2DObject
} from "/three.js-r123/examples/jsm/renderers/CSS2DRenderer.js"
// pointsArrs：一个行政区包含一个或多个轮廓，一个轮廓对应pointsArrs的一个元素
function createLine(pointsArrs, isMercator) {
  var group = new THREE.Group() //一个国家多个轮廓线条line的父对象
  pointsArrs.forEach((polygon) => {
    var pointArr = [] //边界线顶点坐标
    polygon[0].forEach((elem) => {
      if (isMercator) {
        // 经纬度转墨卡托坐标
        var coord = lonLat2Mercator(elem[0], elem[1])
        pointArr.push(coord.x, coord.y, 0)
      } else {
        pointArr.push(elem[0], elem[1], 0)
      }
    })
    group.add(lineLoop(pointArr))
  })
  return group
}

function lineLoop(pointArr) {
  /**
   * 通过BufferGeometry构建一个几何体，传入顶点数据
   * 通过Line模型渲染几何体，连点成线
   * LineLoop和Line功能一样，区别在于首尾顶点相连，轮廓闭合
   */
  var geometry = new THREE.BufferGeometry() //创建一个Buffer类型几何体对象
  //类型数组创建顶点数据
  var vertices = new Float32Array(pointArr)
  // 创建属性缓冲区对象
  var attribue = new THREE.BufferAttribute(vertices, 3) //3个为一组，表示一个顶点的xyz坐标
  // 设置几何体attributes属性的位置属性
  geometry.attributes.position = attribue
  // 线条渲染几何体顶点数据
  var material = new THREE.LineBasicMaterial({
    color: 0x00a5d1 //线条颜色
  }) //材质对象
  // var line = new THREE.Line(geometry, material);//线条模型对象
  var line = new THREE.LineLoop(geometry, material) //首尾顶点连线，轮廓闭合
  return line
}

//普通材质
function shapeMesh(pointsArrs, isMercator) {
  var shapeArr = [] //轮廓形状Shape集合
  pointsArrs.forEach((pointsArr) => {
    var vector2Arr = []
    // 转化为Vector2构成的顶点数组
    pointsArr[0].forEach((elem) => {
      if (isMercator) {
        // 经纬度转墨卡托坐标
        var coord = lonLat2Mercator(elem[0], elem[1])
        vector2Arr.push(new THREE.Vector2(coord.x, coord.y))
      } else {
        vector2Arr.push(new THREE.Vector2(elem[0], elem[1]))
      }
    })
    var shape = new THREE.Shape(vector2Arr)
    shapeArr.push(shape)
  })
  var material = new THREE.MeshBasicMaterial({
    color: 0x6495ed,
    side: THREE.DoubleSide //两面可见
  }) //材质对象
  var geometry = new THREE.ShapeBufferGeometry(shapeArr)
  var mesh = new THREE.Mesh(geometry, material) //网格模型对象
  return mesh
}

// 拉伸材质
function ExtrudeMesh(pointsArrs, height, isMercator) {
  var shapeArr = [] //轮廓形状Shape集合
  pointsArrs.forEach((pointsArr) => {
    var vector2Arr = []
    // 转化为Vector2构成的顶点数组
    pointsArr[0].forEach((elem) => {
      if (isMercator) {
        // 经纬度转墨卡托坐标
        var coord = lonLat2Mercator(elem[0], elem[1])
        vector2Arr.push(new THREE.Vector2(coord.x, coord.y))
      } else {
        vector2Arr.push(new THREE.Vector2(elem[0], elem[1]))
      }
    })
    var shape = new THREE.Shape(vector2Arr)
    shapeArr.push(shape)
  })
  // MeshBasicMaterial:不受光照影响
  // MeshLambertMaterial：几何体表面和光线角度不同，明暗不同
  var material = new THREE.MeshLambertMaterial({
    color: 0x1479b1
    // transparent: true,
    // opacity: 0.8,
  }) //材质对象
  var geometry = new THREE.ExtrudeBufferGeometry( //拉伸造型
    shapeArr, //多个多边形二维轮廓
    //拉伸参数
    {
      // depth：根据行政区尺寸范围设置，比如高度设置为尺寸范围的2%，过小感觉不到高度，过大太高了
      depth: height, //拉伸高度
      bevelEnabled: false //无倒角
    }
  )
  var mesh = new THREE.Mesh(geometry, material) //网格模型对象
  return mesh
}

// 经纬度转墨卡托坐标公式
function lonLat2Mercator(E, N) {
  var x = (E * 20037508.34) / 180
  var y = Math.log(Math.tan(((90 + N) * Math.PI) / 360)) / (Math.PI / 180)
  y = (y * 20037508.34) / 180
  return {
    x: x, //墨卡托x坐标——对应经度
    y: y //墨卡托y坐标——对应维度
  }
}

// 矩形平面网格模型设置背景透明的png贴图
var geometry = new THREE.PlaneBufferGeometry(1, 1) //默认在XOY平面上
var textureLoader = new THREE.TextureLoader() // TextureLoader创建一个纹理加载器对象
var texture = textureLoader.load("/assest/dot.png")
var material = new THREE.MeshBasicMaterial({
  map: texture,
  transparent: true //使用背景透明的png贴图，注意开启透明计算
  // side: THREE.DoubleSide, //双面可见
})

// 所有矩形平面mesh材质material和几何体geometry可以共享

// size:矩形平面Mesh的尺寸
// x，y表示矩形平面在一个平面上位置坐标
function cityPointMesh(size, x, y) {
  var mesh = new THREE.Mesh(geometry, material)
  mesh.scale.set(size, size, size) //设置mesh大小
  mesh.position.set(x, y, 0) //设置mesh位置
  return mesh
}

// 创建一个HTML标签
function tag(name, x, y, z) {
  // 创建div元素(作为标签)
  var div = document.createElement("div")
  div.innerHTML = name
  div.style.padding = "5px 10px"
  div.style.color = "#fff"
  div.style.fontSize = "12px"
  div.style.position = "absolute"
  div.style.backgroundColor = "rgba(25,25,25,0.5)"
  div.style.borderRadius = "5px"
  //div元素包装为CSS2模型对象CSS2DObject
  var label = new CSS2DObject(div)
  div.style.pointerEvents = "none" //避免HTML标签遮挡三维场景的鼠标事件
  // 设置HTML元素标签在three.js世界坐标中位置
  label.position.set(x, y, z)
  return label //返回CSS2模型标签
}

// 创建一个CSS2渲染器CSS2DRenderer
var labelRenderer = new CSS2DRenderer()
labelRenderer.setSize(window.innerWidth, window.innerHeight)
labelRenderer.domElement.style.position = "absolute"
// // 避免renderer.domElement影响HTMl标签定位，设置top为0px
labelRenderer.domElement.style.top = "0px"
labelRenderer.domElement.style.left = "0px"
// //设置.pointerEvents=none，以免模型标签HTML元素遮挡鼠标选择场景模型
labelRenderer.domElement.style.pointerEvents = "none"
document.body.appendChild(labelRenderer.domElement)

// 拉伸材质
function ExtrudeMeshTest(pointsArrs, height) {
  var shapeArr = [] //轮廓形状Shape集合
  pointsArrs.forEach((pointsArr) => {
    var vector2Arr = []
    pointsArr[0].forEach((elem) => {
      vector2Arr.push(new THREE.Vector2(elem[0], elem[1]))
    })
    var shape = new THREE.Shape(vector2Arr)
    shapeArr.push(shape)
  })
  var material = new THREE.MeshPhongMaterial({
    color: 0x1479b1
  }) //材质对象
  var geometry = new THREE.ExtrudeGeometry( //拉伸造型
    shapeArr, //多个多边形二维轮廓
    {
      depth: height, //拉伸高度
      bevelEnabled: false //无倒角
    }
  )
  var mesh = new THREE.Mesh(geometry, material) //网格模型对象
  return mesh
}

export {
  createLine,
  shapeMesh,
  ExtrudeMesh,
  cityPointMesh,
  tag,
  labelRenderer,
  ExtrudeMeshTest
}
