package log

import (
	"common/utils"
	"fmt"

	"go.uber.org/zap"
)

var logger *zap.Logger
var loggerInternal *zap.SugaredLogger
var undo func()
var A int

func init() {
	println("logger init...")
	var err error
	if utils.GetEnv("APP_LOG_DEVELOPMENT", "") == "true" {
		logger, err = zap.NewDevelopment()
	} else {
		logger, err = zap.NewProduction()
	}
	if err != nil {
		panic(fmt.Errorf("can't initialize zap logger: %w", err))
	}
	loggerInternal = logger.WithOptions(zap.AddCallerSkip(1)).Sugar()
	undo = zap.ReplaceGlobals(logger)
}

func Shutdown() {
	logger.Info("logger shutdown...")
	undo()
	loggerInternal.Sync()
	logger.Sync() // flushes buffer, if any
}

func L() *zap.Logger {
	return logger
}

func S() *zap.SugaredLogger {
	return logger.Sugar()
}

func With(args ...interface{}) *zap.SugaredLogger {
	return S().With(args...)
}

func Debug(args ...interface{}) {
	loggerInternal.Debug(args...)
}

func Debugf(template string, args ...interface{}) {
	loggerInternal.Debugf(template, args...)
}

func Debugw(msg string, args ...interface{}) {
	loggerInternal.Debugw(msg, args...)
}

func Info(args ...interface{}) {
	loggerInternal.Info(args...)
}

func Infof(template string, args ...interface{}) {
	loggerInternal.Infof(template, args...)
}

func Infow(msg string, args ...interface{}) {
	loggerInternal.Infow(msg, args...)
}

func Warn(args ...interface{}) {
	loggerInternal.Warn(args...)
}

func Warnf(template string, args ...interface{}) {
	loggerInternal.Warnf(template, args)
}

func Warnw(msg string, args ...interface{}) {
	loggerInternal.Warnw(msg, args...)
}

func Error(args ...interface{}) {
	loggerInternal.Error(args...)
}

func Errorf(template string, args ...interface{}) {
	loggerInternal.Errorf(template, args...)
}

func Errorw(msg string, args ...interface{}) {
	loggerInternal.Errorw(msg, args...)
}

func DPanic(args ...interface{}) {
	loggerInternal.DPanic(args...)
}

func DPanicf(template string, args ...interface{}) {
	loggerInternal.DPanicf(template, args...)
}

func DPanicw(msg string, args ...interface{}) {
	loggerInternal.DPanicw(msg, args...)
}

func Panic(args ...interface{}) {
	loggerInternal.Panic(args...)
}

func Panicf(template string, args ...interface{}) {
	loggerInternal.Panicf(template, args...)
}

func Panicw(msg string, args ...interface{}) {
	loggerInternal.Panicw(msg, args...)
}

func Fatal(args ...interface{}) {
	loggerInternal.Fatal(args...)
}

func Fatalf(template string, args ...interface{}) {
	loggerInternal.Fatalf(template, args...)
}

func Fatalw(msg string, args ...interface{}) {
	loggerInternal.Fatalw(msg, args...)
}
