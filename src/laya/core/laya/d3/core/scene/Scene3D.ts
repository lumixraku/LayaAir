import { Laya } from "Laya";
import { Laya3D } from "./../../../../Laya3D";
import { BoundsOctree } from "././BoundsOctree";
import { Config3D } from "./../../../../Config3D";
import { CastShadowList } from "../../CastShadowList"
	import { Input3D } from "../../Input3D"
	import { Animator } from "../../component/Animator"
	import { Script3D } from "../../component/Script3D"
	import { SimpleSingletonList } from "../../component/SimpleSingletonList"
	import { BaseCamera } from "../BaseCamera"
	import { Camera } from "../Camera"
	import { RenderableSprite3D } from "../RenderableSprite3D"
	import { Sprite3D } from "../Sprite3D"
	import { LightSprite } from "../light/LightSprite"
	import { BaseMaterial } from "../material/BaseMaterial"
	import { RenderState } from "../material/RenderState"
	import { PixelLineMaterial } from "../pixelLine/PixelLineMaterial"
	import { PixelLineSprite3D } from "../pixelLine/PixelLineSprite3D"
	import { BaseRender } from "../render/BaseRender"
	import { RenderContext3D } from "../render/RenderContext3D"
	import { RenderElement } from "../render/RenderElement"
	import { RenderQueue } from "../render/RenderQueue"
	import { FrustumCulling } from "../../graphics/FrustumCulling"
	import { StaticBatchManager } from "../../graphics/StaticBatchManager"
	import { Vector3 } from "../../math/Vector3"
	import { Vector4 } from "../../math/Vector4"
	import { Viewport } from "../../math/Viewport"
	import { PhysicsComponent } from "../../physics/PhysicsComponent"
	import { PhysicsSimulation } from "../../physics/PhysicsSimulation"
	import { RenderTexture } from "../../resource/RenderTexture"
	import { TextureCube } from "../../resource/TextureCube"
	import { SkyBox } from "../../resource/models/SkyBox"
	import { SkyDome } from "../../resource/models/SkyDome"
	import { SkyRenderer } from "../../resource/models/SkyRenderer"
	import { DefineDatas } from "../../shader/DefineDatas"
	import { Shader3D } from "../../shader/Shader3D"
	import { ShaderData } from "../../shader/ShaderData"
	import { ShaderInit3D } from "../../shader/ShaderInit3D"
	import { ParallelSplitShadowMap } from "../../shadowMap/ParallelSplitShadowMap"
	import { Utils3D } from "../../utils/Utils3D"
	import { Sprite } from "laya/display/Sprite"
	import { LayaGL } from "laya/layagl/LayaGL"
	import { Loader } from "laya/net/Loader"
	import { URL } from "laya/net/URL"
	import { Render } from "laya/renders/Render"
	import { BaseTexture } from "laya/resource/BaseTexture"
	import { Context } from "laya/resource/Context"
	import { ICreateResource } from "laya/resource/ICreateResource"
	import { ISingletonElement } from "laya/resource/ISingletonElement"
	import { RenderTexture2D } from "laya/resource/RenderTexture2D"
	import { Texture2D } from "laya/resource/Texture2D"
	import { Handler } from "laya/utils/Handler"
	import { Timer } from "laya/utils/Timer"
	import { WebGL } from "laya/webgl/WebGL"
	import { WebGLContext } from "laya/webgl/WebGLContext"
	import { ISubmit } from "laya/webgl/submit/ISubmit"
	import { Submit } from "laya/webgl/submit/Submit"
	import { SubmitBase } from "laya/webgl/submit/SubmitBase"
	import { SubmitKey } from "laya/webgl/submit/SubmitKey"
	
	/**
	 * <code>Scene3D</code> 类用于实现场景。
	 */
	export class Scene3D extends Sprite implements ISubmit, ICreateResource {
		/**@private */
		 static REFLECTIONMODE_SKYBOX:number = 0;
		/**@private */
		 static REFLECTIONMODE_CUSTOM:number = 1;
		
		/**@private */
		 static SHADERDEFINE_FOG:number;
		/**@private */
		 static SHADERDEFINE_DIRECTIONLIGHT:number;
		/**@private */
		 static SHADERDEFINE_POINTLIGHT:number;
		/**@private */
		 static SHADERDEFINE_SPOTLIGHT:number;
		/**@private */
		 static SHADERDEFINE_CAST_SHADOW:number;
		/**@private */
		 static SHADERDEFINE_SHADOW_PSSM1:number;
		/**@private */
		 static SHADERDEFINE_SHADOW_PSSM2:number;
		/**@private */
		 static SHADERDEFINE_SHADOW_PSSM3:number;
		/**@private */
		 static SHADERDEFINE_SHADOW_PCF_NO:number;
		/**@private */
		 static SHADERDEFINE_SHADOW_PCF1:number;
		/**@private */
		 static SHADERDEFINE_SHADOW_PCF2:number;
		/**@private */
		 static SHADERDEFINE_SHADOW_PCF3:number;
		/**@private */
		 static SHADERDEFINE_REFLECTMAP:number;
		
		 static FOGCOLOR:number = Shader3D.propertyNameToID("u_FogColor");
		 static FOGSTART:number = Shader3D.propertyNameToID("u_FogStart");
		 static FOGRANGE:number = Shader3D.propertyNameToID("u_FogRange");
		
		 static LIGHTDIRECTION:number = Shader3D.propertyNameToID("u_DirectionLight.Direction");
		 static LIGHTDIRCOLOR:number = Shader3D.propertyNameToID("u_DirectionLight.Color");
		
		 static POINTLIGHTPOS:number = Shader3D.propertyNameToID("u_PointLight.Position");
		 static POINTLIGHTRANGE:number = Shader3D.propertyNameToID("u_PointLight.Range");
		 static POINTLIGHTATTENUATION:number = Shader3D.propertyNameToID("u_PointLight.Attenuation");
		 static POINTLIGHTCOLOR:number = Shader3D.propertyNameToID("u_PointLight.Color");
		
		 static SPOTLIGHTPOS:number = Shader3D.propertyNameToID("u_SpotLight.Position");
		 static SPOTLIGHTDIRECTION:number = Shader3D.propertyNameToID("u_SpotLight.Direction");
		 static SPOTLIGHTSPOTANGLE:number = Shader3D.propertyNameToID("u_SpotLight.Spot");
		 static SPOTLIGHTRANGE:number = Shader3D.propertyNameToID("u_SpotLight.Range");
		 static SPOTLIGHTCOLOR:number = Shader3D.propertyNameToID("u_SpotLight.Color");
		
		 static SHADOWDISTANCE:number = Shader3D.propertyNameToID("u_shadowPSSMDistance");
		 static SHADOWLIGHTVIEWPROJECT:number = Shader3D.propertyNameToID("u_lightShadowVP");
		 static SHADOWMAPPCFOFFSET:number = Shader3D.propertyNameToID("u_shadowPCFoffset");
		 static SHADOWMAPTEXTURE1:number = Shader3D.propertyNameToID("u_shadowMap1");
		 static SHADOWMAPTEXTURE2:number = Shader3D.propertyNameToID("u_shadowMap2");
		 static SHADOWMAPTEXTURE3:number = Shader3D.propertyNameToID("u_shadowMap3");
		
		 static AMBIENTCOLOR:number = Shader3D.propertyNameToID("u_AmbientColor");
		 static REFLECTIONTEXTURE:number = Shader3D.propertyNameToID("u_ReflectTexture");
		 static REFLETIONINTENSITY:number = Shader3D.propertyNameToID("u_ReflectIntensity");
		 static TIME:number = Shader3D.propertyNameToID("u_Time");
		 static ANGLEATTENUATIONTEXTURE:number = Shader3D.propertyNameToID("u_AngleTexture");
		 static RANGEATTENUATIONTEXTURE:number = Shader3D.propertyNameToID("u_RangeTexture");
		 static POINTLIGHTMATRIX:number = Shader3D.propertyNameToID("u_PointLightMatrix");
		 static SPOTLIGHTMATRIX:number = Shader3D.propertyNameToID("u_SpotLightMatrix");
		
		/**
		 *@private
		 */
		 static _parse(data:any, propertyParams:any = null, constructParams:any[] = null):Scene3D {
			var json:any = data.data;
			var outBatchSprits:RenderableSprite3D[] = [];
			var scene:Scene3D;
			switch (data.version) {
			case "LAYASCENE3D:02": 
				scene = (<Scene3D>Utils3D._createNodeByJson02(json, outBatchSprits) );
				break;
			default: 
				scene = (<Scene3D>Utils3D._createNodeByJson(json, outBatchSprits) );
			}
			
			StaticBatchManager.combine(null, outBatchSprits);
			return scene;
		}
		
		/**
		 * 加载场景,注意:不缓存。
		 * @param url 模板地址。
		 * @param complete 完成回调。
		 */
		 static load(url:string, complete:Handler):void {
			Laya.loader.create(url, complete, null, Laya3D.HIERARCHY);
		}
		
		/**@private */
		private _url:string;
		/**@private */
		private _group:string;
		/** @private */
		private _lights:LightSprite[] = [];
		/** @private */
		private _lightmaps:Texture2D[] = [];
		/** @private */
		private _skyRenderer:SkyRenderer = new SkyRenderer();
		/** @private */
		private _reflectionMode:number = 1;
		/** @private */
		private _enableLightCount:number = 3;
		/** @private */
		private _renderTargetTexture:RenderTexture2D;
		/** @private */
		private _enableFog:boolean;
		/**@private */
		 _physicsSimulation:PhysicsSimulation;
		/**@private */
		private _input:Input3D = new Input3D();
		/**@private */
		private _timer:Timer = Laya.timer;
		
		/**@private */
		 _octree:BoundsOctree;
		/** @private 只读,不允许修改。*/
		 _collsionTestList:number[] = [];
		
		/** @private */
		 _shaderValues:ShaderData;
		/** @private */
		 _renders:SimpleSingletonList = new SimpleSingletonList();
		/** @private */
		 _opaqueQueue:RenderQueue = new RenderQueue(false);
		/** @private */
		 _transparentQueue:RenderQueue = new RenderQueue(true);
		/** @private 相机的对象池*/
		 _cameraPool:BaseCamera[] = [];
		/**@private */
		 _animatorPool:SimpleSingletonList = new SimpleSingletonList();
		/**@private */
		 _scriptPool:SimpleSingletonList = new SimpleSingletonList();
		
		/** @private */
		 _castShadowRenders:CastShadowList = new CastShadowList();
		
		/** 当前创建精灵所属遮罩层。*/
		 currentCreationLayer:number = Math.pow(2, 0);
		/** 是否启用灯光。*/
		 enableLight:boolean = true;
		
		//阴影相关变量
		 parallelSplitShadowMaps:ParallelSplitShadowMap[];
		/**@private */
		 _debugTool:PixelLineSprite3D;
		
		/**@private */
		 _key:SubmitKey = new SubmitKey();
		
		private _time:number = 0;
		
		/**@private	[NATIVE]*/
		 _cullingBufferIndices:Int32Array;
		/**@private	[NATIVE]*/
		 _cullingBufferResult:Int32Array;
		
		/**@private [Editer]*/
		 _pickIdToSprite:any = new Object();
		
		/**
		 * @private
		 * [Editer]
		 */
		 _allotPickColorByID(id:number, pickColor:Vector4):void {
			
			var pickColorR:number = Math.floor(id / (255 * 255));
			id -= pickColorR * 255 * 255;
			var pickColorG:number = Math.floor(id / 255);
			id -= pickColorG * 255;
			var pickColorB:number = id;
			
			pickColor.x = pickColorR / 255;
			pickColor.y = pickColorG / 255;
			pickColor.z = pickColorB / 255;
			pickColor.w = 1.0;
		}
		
		/**
		 * @private
		 * [Editer]
		 */
		 _searchIDByPickColor(pickColor:Vector4):number {
			var id:number = pickColor.x * 255 * 255 + pickColor.y * 255 + pickColor.z;
			return id;
		}
		
		/**
		 * 获取资源的URL地址。
		 * @return URL地址。
		 */
		 get url():string {
			return this._url;
		}
		
		/**
		 * 获取是否允许雾化。
		 * @return 是否允许雾化。
		 */
		 get enableFog():boolean {
			return this._enableFog;
		}
		
		/**
		 * 设置是否允许雾化。
		 * @param value 是否允许雾化。
		 */
		 set enableFog(value:boolean) {
			if (this._enableFog !== value) {
				this._enableFog = value;
				if (value) {
					this._shaderValues.addDefine(Scene3D.SHADERDEFINE_FOG);
				} else
					this._shaderValues.removeDefine(Scene3D.SHADERDEFINE_FOG);
			}
		}
		
		/**
		 * 获取雾化颜色。
		 * @return 雾化颜色。
		 */
		 get fogColor():Vector3 {
			return (<Vector3>this._shaderValues.getVector3(Scene3D.FOGCOLOR) );
		}
		
		/**
		 * 设置雾化颜色。
		 * @param value 雾化颜色。
		 */
		 set fogColor(value:Vector3) {
			this._shaderValues.setVector3(Scene3D.FOGCOLOR, value);
		}
		
		/**
		 * 获取雾化起始位置。
		 * @return 雾化起始位置。
		 */
		 get fogStart():number {
			return this._shaderValues.getNumber(Scene3D.FOGSTART);
		}
		
		/**
		 * 设置雾化起始位置。
		 * @param value 雾化起始位置。
		 */
		 set fogStart(value:number) {
			this._shaderValues.setNumber(Scene3D.FOGSTART, value);
		}
		
		/**
		 * 获取雾化范围。
		 * @return 雾化范围。
		 */
		 get fogRange():number {
			return this._shaderValues.getNumber(Scene3D.FOGRANGE);
		}
		
		/**
		 * 设置雾化范围。
		 * @param value 雾化范围。
		 */
		 set fogRange(value:number) {
			this._shaderValues.setNumber(Scene3D.FOGRANGE, value);
		}
		
		/**
		 * 获取环境光颜色。
		 * @return 环境光颜色。
		 */
		 get ambientColor():Vector3 {
			return (<Vector3>this._shaderValues.getVector3(Scene3D.AMBIENTCOLOR) );
		}
		
		/**
		 * 设置环境光颜色。
		 * @param value 环境光颜色。
		 */
		 set ambientColor(value:Vector3) {
			this._shaderValues.setVector3(Scene3D.AMBIENTCOLOR, value);
		}
		
		/**
		 * 获取天空渲染器。
		 * @return 天空渲染器。
		 */
		 get skyRenderer():SkyRenderer {
			return this._skyRenderer;
		}
		
		/**
		 * 获取反射贴图。
		 * @return 反射贴图。
		 */
		 get customReflection():TextureCube {
			return (<TextureCube>this._shaderValues.getTexture(Scene3D.REFLECTIONTEXTURE) );
		}
		
		/**
		 * 设置反射贴图。
		 * @param 反射贴图。
		 */
		 set customReflection(value:TextureCube) {
			this._shaderValues.setTexture(Scene3D.REFLECTIONTEXTURE, value);
			if (value)
				this._shaderValues.addDefine(Scene3D.SHADERDEFINE_REFLECTMAP);
			else
				this._shaderValues.removeDefine(Scene3D.SHADERDEFINE_REFLECTMAP);
		}
		
		/**
		 * 获取反射强度。
		 * @return 反射强度。
		 */
		 get reflectionIntensity():number {
			return this._shaderValues.getNumber(Scene3D.REFLETIONINTENSITY);
		}
		
		/**
		 * 设置反射强度。
		 * @param 反射强度。
		 */
		 set reflectionIntensity(value:number) {
			value = Math.max(Math.min(value, 1.0), 0.0);
			this._shaderValues.setNumber(Scene3D.REFLETIONINTENSITY, value);
		}
		
		/**
		 * 获取物理模拟器。
		 * @return 物理模拟器。
		 */
		 get physicsSimulation():PhysicsSimulation {
			return this._physicsSimulation;
		}
		
		/**
		 * 获取反射模式。
		 * @return 反射模式。
		 */
		 get reflectionMode():number {
			return this._reflectionMode;
		}
		
		/**
		 * 设置反射模式。
		 * @param value 反射模式。
		 */
		 set reflectionMode(value:number) {
			this._reflectionMode = value;
		}
		
		/**
		 * 获取场景时钟。
		 */
		/*override*/  get timer():Timer {
			return this._timer;
		}
		
		/**
		 * 设置场景时钟。
		 */
		 set timer(value:Timer) {
			this._timer = value;
		}
		
		/**
		 *	获取输入。
		 * 	@return  输入。
		 */
		 get input():Input3D {
			return this._input;
		}
		
		/**
		 * 创建一个 <code>Scene3D</code> 实例。
		 */
		constructor(){
			/*[DISABLE-ADD-VARIABLE-DEFAULT-VALUE]*/
			super();
if (Laya3D._enbalePhysics)
				this._physicsSimulation = new PhysicsSimulation(Laya3D.physicsSettings);
			
			this._shaderValues = new ShaderData(null);
			this.parallelSplitShadowMaps = [];
			
			this.enableFog = false;
			this.fogStart = 300;
			this.fogRange = 1000;
			this.fogColor = new Vector3(0.7, 0.7, 0.7);
			this.ambientColor = new Vector3(0.212, 0.227, 0.259);
			this.reflectionIntensity = 1.0;
			(WebGL.shaderHighPrecision) && (this._shaderValues.addDefine(Shader3D.SHADERDEFINE_HIGHPRECISION));
			
			if (Render.supportWebGLPlusCulling) {//[NATIVE]
				this._cullingBufferIndices = new Int32Array(1024);
				this._cullingBufferResult = new Int32Array(1024);
			}
			
			this._shaderValues.setTexture(Scene3D.RANGEATTENUATIONTEXTURE, ShaderInit3D._rangeAttenTex);
			
			//var angleAttenTex:Texture2D = Texture2D.buildTexture2D(64, 64, BaseTexture.FORMAT_Alpha8, TextureGenerator.haloTexture);
			//_shaderValues.setTexture(Scene3D.ANGLEATTENUATIONTEXTURE, angleAttenTex);
			this._scene = this;
			if (Laya3D._enbalePhysics && !PhysicsSimulation.disableSimulation)//不引物理库初始化Input3D会内存泄漏 
				this._input.__init__(Render.canvas, this);
			
			var config:Config3D = Laya3D._config;
			if (config.octreeCulling) {
				this._octree = new BoundsOctree(config.octreeInitialSize, config.octreeInitialCenter, config.octreeMinNodeSize, config.octreeLooseness);
			}
			
			if (Laya3D._config.debugFrustumCulling) {
				this._debugTool = new PixelLineSprite3D();
				var lineMaterial:PixelLineMaterial = new PixelLineMaterial();
				lineMaterial.renderQueue = BaseMaterial.RENDERQUEUE_TRANSPARENT;
				lineMaterial.alphaTest = false;
				lineMaterial.depthWrite = false;
				lineMaterial.cull = RenderState.CULL_BACK;
				lineMaterial.blend = RenderState.BLEND_ENABLE_ALL;
				lineMaterial.blendSrc = RenderState.BLENDPARAM_SRC_ALPHA;
				lineMaterial.blendDst = RenderState.BLENDPARAM_ONE_MINUS_SRC_ALPHA;
				lineMaterial.depthTest = RenderState.DEPTHTEST_LESS;
				this._debugTool.pixelLineRenderer.sharedMaterial = lineMaterial;
			}
		}
		
		/**
		 * @private
		 */
		private _setLightmapToChildNode(sprite:Sprite3D):void {
			if (sprite instanceof RenderableSprite3D)
				((<RenderableSprite3D>sprite ))._render._applyLightMapParams();
			
			var children:any[] = sprite._children;
			for (var i:number = 0, n:number = children.length; i < n; i++)
				this._setLightmapToChildNode(children[i]);
		}
		
		/**
		 *@private
		 */
		private _update():void {
			var delta:number = this.timer._delta / 1000;
			this._time += delta;
			this._shaderValues.setNumber(Scene3D.TIME, this._time);
			
			var simulation:PhysicsSimulation = this._physicsSimulation;
			if (Laya3D._enbalePhysics && !PhysicsSimulation.disableSimulation) {
				simulation._updatePhysicsTransformFromRender();
				PhysicsComponent._addUpdateList = false;//物理模拟器会触发_updateTransformComponent函数,不加入更新队列
				//simulate physics
				simulation._simulate(delta);
				//update character sprite3D transforms from physics engine simulation
				simulation._updateCharacters();
				PhysicsComponent._addUpdateList = true;
				
				//handle frame contacts
				simulation._updateCollisions();
				
				//send contact events
				simulation._eventScripts();
				
				this._input._update();//允许物理才更新
			}
			
			this._updateScript();
			Animator._update(this);
			this._lateUpdateScript();
		}
		
		/**
		 * @private
		 */
		private _binarySearchIndexInCameraPool(camera:BaseCamera):number {
			var start:number = 0;
			var end:number = this._cameraPool.length - 1;
			var mid:number;
			while (start <= end) {
				mid = Math.floor((start + end) / 2);
				var midValue:number = this._cameraPool[mid]._renderingOrder;
				if (midValue == camera._renderingOrder)
					return mid;
				else if (midValue > camera._renderingOrder)
					end = mid - 1;
				else
					start = mid + 1;
			}
			return start;
		}
		
		/**
		 * @private
		 */
		 _setCreateURL(url:string):void {
			this._url = URL.formatURL(url);
		}
		
		/**
		 * @private
		 */
		 _getGroup():string {
			return this._group;
		}
		
		/**
		 * @private
		 */
		 _setGroup(value:string):void {
			this._group = value;
		}
		
		/**
		 * @private
		 */
		private _updateScript():void {
			var pool:SimpleSingletonList = this._scriptPool;
			var elements:ISingletonElement[] = pool.elements;
			for (var i:number = 0, n:number = pool.length; i < n; i++) {
				var script:Script3D = (<Script3D>elements[i] );
				(script && script.enabled) && (script.onUpdate());
			}
		}
		
		/**
		 * @private
		 */
		private _lateUpdateScript():void {
			var pool:SimpleSingletonList = this._scriptPool;
			var elements:ISingletonElement[] = pool.elements;
			for (var i:number = 0, n:number = pool.length; i < n; i++) {
				var script:Script3D = (<Script3D>elements[i] );
				(script && script.enabled) && (script.onLateUpdate());
			}
		}
		
		/**
		 * @private
		 */
		 _preRenderScript():void {
			var pool:SimpleSingletonList = this._scriptPool;
			var elements:ISingletonElement[] = pool.elements;
			for (var i:number = 0, n:number = pool.length; i < n; i++) {
				var script:Script3D = (<Script3D>elements[i] );
				(script && script.enabled) && (script.onPreRender());
			}
		}
		
		/**
		 * @private
		 */
		 _postRenderScript():void {
			var pool:SimpleSingletonList = this._scriptPool;
			var elements:ISingletonElement[] = pool.elements;
			for (var i:number = 0, n:number = pool.length; i < n; i++) {
				var script:Script3D = (<Script3D>elements[i] );
				(script && script.enabled) && (script.onPostRender());
			}
		}
		
		/**
		 * @private
		 */
		protected _prepareSceneToRender():void {
			var lightCount:number = this._lights.length;
			if (lightCount > 0) {
				var renderLightCount:number = 0;
				for (var i:number = 0; i < lightCount; i++) {
					if (!this._lights[i]._prepareToScene())//TODO:应该直接移除
						continue;
					renderLightCount++;
					if (renderLightCount >= this._enableLightCount)
						break;
				}
			}
		}
		
		/**
		 * @private
		 */
		 _addCamera(camera:BaseCamera):void {
			var index:number = this._binarySearchIndexInCameraPool(camera);
			var order:number = camera._renderingOrder;
			var count:number = this._cameraPool.length;
			while (index < count && this._cameraPool[index]._renderingOrder <= order)
				index++;
			this._cameraPool.splice(index, 0, camera);
		}
		
		/**
		 * @private
		 */
		 _removeCamera(camera:BaseCamera):void {
			this._cameraPool.splice(this._cameraPool.indexOf(camera), 1);
		}
		
		/**
		 * @private
		 */
		 _preCulling(context:RenderContext3D, camera:Camera):void {
			FrustumCulling.renderObjectCulling(camera, this, context, this._renders);
		}
		
		/**
		 * @private
		 */
		 _clear(gl:WebGLContext, state:RenderContext3D):void {
			var viewport:Viewport = state.viewport;
			var camera:Camera = (<Camera>state.camera );
			var renderTexture:RenderTexture = camera._renderTexture;
			var vpW:number = viewport.width;
			var vpH:number = viewport.height;
			var vpX:number = viewport.x;
			var vpY:number = camera._getCanvasHeight() - viewport.y - vpH;
			gl.viewport(vpX, vpY, vpW, vpH);
			var flag:number;
			var clearFlag:number = camera.clearFlag;
			if (clearFlag === BaseCamera.CLEARFLAG_SKY && !(camera.skyRenderer._isAvailable() || this._skyRenderer._isAvailable()))
				clearFlag = BaseCamera.CLEARFLAG_SOLIDCOLOR;
			
			switch (clearFlag) {
			case BaseCamera.CLEARFLAG_SOLIDCOLOR: 
				var clearColor:Vector4 = camera.clearColor;
				gl.enable(WebGLContext.SCISSOR_TEST);
				gl.scissor(vpX, vpY, vpW, vpH);
				if (clearColor)
					gl.clearColor(clearColor.x, clearColor.y, clearColor.z, clearColor.w);
				else
					gl.clearColor(0, 0, 0, 0);
				if (renderTexture) {
					flag = WebGLContext.COLOR_BUFFER_BIT;
					switch (renderTexture.depthStencilFormat) {
					case BaseTexture.FORMAT_DEPTH_16: 
						flag |= WebGLContext.DEPTH_BUFFER_BIT;
						break;
					case BaseTexture.FORMAT_STENCIL_8: 
						flag |= WebGLContext.STENCIL_BUFFER_BIT;
						break;
					case BaseTexture.FORMAT_DEPTHSTENCIL_16_8: 
						flag |= WebGLContext.DEPTH_BUFFER_BIT;
						flag |= WebGLContext.STENCIL_BUFFER_BIT;
						break;
					}
				} else {
					flag = WebGLContext.COLOR_BUFFER_BIT | WebGLContext.DEPTH_BUFFER_BIT;
				}
				WebGLContext.setDepthMask(gl, true);
				gl.clear(flag);
				gl.disable(WebGLContext.SCISSOR_TEST);
				break;
			case BaseCamera.CLEARFLAG_SKY: 
			case BaseCamera.CLEARFLAG_DEPTHONLY: 
				gl.enable(WebGLContext.SCISSOR_TEST);
				gl.scissor(vpX, vpY, vpW, vpH);
				if (renderTexture) {
					switch (renderTexture.depthStencilFormat) {
					case BaseTexture.FORMAT_DEPTH_16: 
						flag = WebGLContext.DEPTH_BUFFER_BIT;
						break;
					case BaseTexture.FORMAT_STENCIL_8: 
						flag = WebGLContext.STENCIL_BUFFER_BIT;
						break;
					case BaseTexture.FORMAT_DEPTHSTENCIL_16_8: 
						flag = WebGLContext.DEPTH_BUFFER_BIT | WebGLContext.STENCIL_BUFFER_BIT;
						break;
					}
				} else {
					flag = WebGLContext.DEPTH_BUFFER_BIT;
				}
				WebGLContext.setDepthMask(gl, true);
				gl.clear(flag);
				gl.disable(WebGLContext.SCISSOR_TEST);
				break;
			case BaseCamera.CLEARFLAG_NONE: 
				break;
			default: 
				throw new Error("BaseScene:camera clearFlag invalid.");
			}
		}
		
		/**
		 * @private
		 */
		 _renderScene(gl:WebGLContext, state:RenderContext3D, customShader:Shader3D = null, replacementTag:string = null):void {
			var camera:Camera = (<Camera>state.camera );
			var position:Vector3 = camera.transform.position;
			camera._renderTexture ? this._opaqueQueue._render(state, true, customShader, replacementTag) : this._opaqueQueue._render(state, false, customShader, replacementTag);//非透明队列
			if (camera.clearFlag === BaseCamera.CLEARFLAG_SKY) {
				if (camera.skyRenderer._isAvailable())
					camera.skyRenderer._render(state);
				else if (this._skyRenderer._isAvailable())
					this._skyRenderer._render(state);
			}
			camera._renderTexture ? this._transparentQueue._render(state, true, customShader, replacementTag) : this._transparentQueue._render(state, false, customShader, replacementTag);//透明队列

			if (Laya3D._config.debugFrustumCulling) {
				var renderElements:RenderElement[] = this._debugTool._render._renderElements;
				for (var i:number = 0, n:number = renderElements.length; i < n; i++) {
					renderElements[i]._render(state, false, customShader, replacementTag);
				}
			}
		}
		
		/**
		 * @inheritDoc
		 */
		/*override*/  _parse(data:any, spriteMap:any):void {
			var lightMapsData:any[] = data.lightmaps;
			if (lightMapsData) {
				var lightMapCount:number = lightMapsData.length;
				var lightmaps:Texture2D[] = [];
				for (var i:number = 0; i < lightMapCount; i++)
					lightmaps[i] = Loader.getRes(lightMapsData[i].path);
				
				this.setlightmaps(lightmaps);
			}
			
			var ambientColorData:any[] = data.ambientColor;
			if (ambientColorData) {
				var ambCol:Vector3 = this.ambientColor;
				ambCol.fromArray(ambientColorData);
				this.ambientColor = ambCol;
			}
			
			var skyData:any = data.sky;
			if (skyData) {
				this._skyRenderer.material = Loader.getRes(skyData.material.path);
				switch (skyData.mesh) {
				case "SkyBox": 
					this._skyRenderer.mesh = SkyBox.instance;
					break;
				case "SkyDome": 
					this._skyRenderer.mesh = SkyDome.instance;
					break;
				default: 
					this.skyRenderer.mesh = SkyBox.instance;
				}
			}
			var reflectionTextureData:string = data.reflectionTexture;
			reflectionTextureData && (this.customReflection = Loader.getRes(reflectionTextureData));
			
			this.enableFog = data.enableFog;
			this.fogStart = data.fogStart;
			this.fogRange = data.fogRange;
			var fogColorData:any[] = data.fogColor;
			if (fogColorData) {
				var fogCol:Vector3 = this.fogColor;
				fogCol.fromArray(fogColorData);
				this.fogColor = fogCol;
			}
		}
		
		/**
		 * @inheritDoc
		 */
		/*override*/ protected _onActive():void {
			super._onActive();
			Laya.stage._scene3Ds.push(this);
		}
		
		/**
		 * @inheritDoc
		 */
		/*override*/ protected _onInActive():void {
			super._onInActive();
			var scenes:any[] = Laya.stage._scene3Ds;
			scenes.splice(scenes.indexOf(this), 1);
		}
		
		/**
		 * @private
		 */
		 _addLight(light:LightSprite):void {
			if (this._lights.indexOf(light) < 0) this._lights.push(light);
		}
		
		/**
		 * @private
		 */
		 _removeLight(light:LightSprite):void {
			var index:number = this._lights.indexOf(light);
			index >= 0 && (this._lights.splice(index, 1));
		}
		
		/**
		 * @private
		 */
		 _addRenderObject(render:BaseRender):void {
			if (this._octree) {
				this._octree.add(render);
			} else {
				this._renders.add(render);
				if (Render.supportWebGLPlusCulling) {//[NATIVE]
					var indexInList:number = render._getIndexInList();
					var length:number = this._cullingBufferIndices.length;
					if (indexInList >= length) {
						var tempIndices:Int32Array = this._cullingBufferIndices;
						var tempResult:Int32Array = this._cullingBufferResult;
						this._cullingBufferIndices = new Int32Array(length + 1024);
						this._cullingBufferResult = new Int32Array(length + 1024);
						this._cullingBufferIndices.set(tempIndices, 0);
						this._cullingBufferResult.set(tempResult, 0);
					}
					this._cullingBufferIndices[indexInList] = render._cullingBufferIndex;
				}
			}
		}
		
		/**
		 * @private
		 */
		 _removeRenderObject(render:BaseRender):void {
			if (this._octree) {
				this._octree.remove(render);
			} else {
				var endRender:BaseRender;
				if (Render.supportWebGLPlusCulling) {//[NATIVE]
					endRender = (<BaseRender>this._renders.elements[this._renders.length - 1] );
				}
				this._renders.remove(render);
				if (Render.supportWebGLPlusCulling) {//[NATIVE]
					this._cullingBufferIndices[endRender._getIndexInList()] = endRender._cullingBufferIndex;
				}
			}
		}
		
		/**
		 * @private
		 */
		 _addShadowCastRenderObject(render:BaseRender):void {
			if (this._octree) {
				//TODO:
				//addTreeNode(render);
			} else {
				this._castShadowRenders.add(render);
			}
		}
		
		/**
		 * @private
		 */
		 _removeShadowCastRenderObject(render:BaseRender):void {
			if (this._octree) {
				//TODO:
				//removeTreeNode(render);
			} else {
				this._castShadowRenders.remove(render);
			}
		}
		
		/**
		 * @private
		 */
		 _getRenderQueue(index:number):RenderQueue {
			if (index <= 2500)//2500作为队列临界点
				return this._opaqueQueue;
			else
				return this._transparentQueue;
		}
		
		/**
		 * 设置光照贴图。
		 * @param value 光照贴图。
		 */
		 setlightmaps(value:Texture2D[]):void {
			var maps:Texture2D[] = this._lightmaps;
			for (var i:number = 0, n:number = maps.length; i < n; i++)
				maps[i]._removeReference();
			if (value) {
				var count:number = value.length;
				maps.length = count;
				for (i = 0; i < count; i++) {
					var lightMap:Texture2D = value[i];
					lightMap._addReference();
					maps[i] = lightMap;
				}
			} else {
				throw new Error("Scene3D: value value can't be null.");
			}
			for (i = 0, n = this._children.length; i < n; i++)
				this._setLightmapToChildNode(this._children[i]);
		}
		
		/**
		 * 获取光照贴图浅拷贝列表。
		 * @return 获取光照贴图浅拷贝列表。
		 */
		 getlightmaps():Texture2D[] {
			return this._lightmaps.slice();//slice()防止修改数组内容
		}
		
		/**
		 * @inheritDoc
		 */
		/*override*/  destroy(destroyChild:boolean = true):void {
			if (this.destroyed)
				return;
			super.destroy(destroyChild);
			this._skyRenderer.destroy();
			this._skyRenderer = null;
			this._lights = null;
			this._lightmaps = null;
			this._renderTargetTexture = null;
			this._shaderValues = null;
			this._renders = null;
			this._castShadowRenders = null;
			this._cameraPool = null;
			this._octree = null;
			this.parallelSplitShadowMaps = null;
			this._physicsSimulation && this._physicsSimulation._destroy();
			Loader.clearRes(this.url);
		}
		
		/**
		 * @inheritDoc
		 */
		/*override*/  render(ctx:Context, x:number, y:number):void {
			//TODO:外层应该设计为接口调用
			ctx._curSubmit = SubmitBase.RENDERBASE;//打断2D合并的renderKey
			this._children.length > 0 && ctx.addRenderObject(this);
		}
		
		/**
		 * @private
		 */
		 renderSubmit():number {
			var gl:any = LayaGL.instance;
			this._prepareSceneToRender();
			
			var i:number, n:number, n1:number;
			for (i = 0, n = this._cameraPool.length, n1 = n - 1; i < n; i++) {
				if (Render.supportWebGLPlusRendering)
					ShaderData.setRuntimeValueMode((i == n1) ? true : false);
				var camera:Camera = (<Camera>this._cameraPool[i] );
				camera.enableRender && camera.render();
			}
			Context.set2DRenderConfig();//还原2D配置
			return 1;
		}
		
		/**
		 * @private
		 */
		 getRenderType():number {
			return 0;
		}
		
		/**
		 * @private
		 */
		 releaseRender():void {
		}
		
		/**
		 * @private
		 */
		 reUse(context:Context, pos:number):number {
			return 0;
		}
	}
