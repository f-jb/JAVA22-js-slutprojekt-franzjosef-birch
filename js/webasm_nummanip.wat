(module
	(func $incr (param $toincr i32) (result i32)
				i32.const 1
				local.get $toincr
				i32.add)
	(func $decr (param $todecr i32) (result i32)
				i32.const 1
				local.get $todecr
				i32.sub)
	(export "incr" (func $incr))
	(export "decr" (func $decr))
	)
